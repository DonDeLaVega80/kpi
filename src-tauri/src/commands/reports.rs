// Report/KPI commands - Monthly KPI generation and history
use crate::db::DbState;
use crate::models::{KPIConfig, KPITrend, MonthlyKPI};
use crate::services::{
    calculate_delivery_score, calculate_overall_score, calculate_quality_score, calculate_trend,
    BugCounts, DeliveryMetrics,
};
use chrono::Utc;
use tauri::State;
use uuid::Uuid;

/// Helper struct for aggregated ticket metrics
#[derive(Debug, Default)]
struct TicketMetrics {
    total_tickets: i32,
    completed_tickets: i32,
    on_time_tickets: i32,
    late_tickets: i32,
    early_deliveries: i32,
    late_critical_tickets: i32,
    reopened_tickets: i32,
    total_delivery_days: f64,
}

/// Helper struct for aggregated bug metrics
#[derive(Debug, Default)]
struct BugMetrics {
    total_bugs: i32,
    developer_error_bugs: i32,
    conceptual_bugs: i32,
    other_bugs: i32,
    dev_error_by_severity: BugCounts,
}

/// Aggregate ticket metrics for a developer in a specific month
fn aggregate_ticket_metrics(
    conn: &rusqlite::Connection,
    developer_id: &str,
    month: i32,
    year: i32,
) -> Result<TicketMetrics, String> {
    let mut metrics = TicketMetrics::default();

    // Build date range for the month (YYYY-MM-DD format)
    let start_date = format!("{:04}-{:02}-01", year, month);
    let end_date = if month == 12 {
        format!("{:04}-01-01", year + 1)
    } else {
        format!("{:04}-{:02}-01", year, month + 1)
    };

    // Query all tickets for this developer that were completed in the given month
    // OR are still assigned in this month (for total count)
    // assigned_date and due_date are stored as YYYY-MM-DD, completed_date might be NULL
    let mut stmt = conn
        .prepare(
            "SELECT 
                status,
                complexity,
                assigned_date,
                due_date,
                completed_date,
                reopen_count
             FROM tickets
             WHERE developer_id = ?1
               AND (
                   -- Completed in this month
                   (status = 'completed' AND completed_date IS NOT NULL AND completed_date >= ?2 AND completed_date < ?3)
                   OR
                   -- Assigned in this month (for total count)
                   (assigned_date >= ?2 AND assigned_date < ?3)
               )",
        )
        .map_err(|e| format!("Failed to prepare ticket query: {}", e))?;

    let rows = stmt
        .query_map([developer_id, &start_date, &end_date], |row| {
            Ok((
                row.get::<_, String>(0)?,          // status
                row.get::<_, String>(1)?,          // complexity
                row.get::<_, String>(2)?,          // assigned_date
                row.get::<_, String>(3)?,          // due_date
                row.get::<_, Option<String>>(4)?,  // completed_date
                row.get::<_, i32>(5)?,             // reopen_count
            ))
        })
        .map_err(|e| format!("Failed to query tickets: {}", e))?;

    for row in rows {
        let (status, complexity, _assigned_date, due_date, completed_date, reopen_count) =
            row.map_err(|e| format!("Failed to read ticket row: {}", e))?;

        metrics.total_tickets += 1;

        if status == "completed" {
            if let Some(ref completed) = completed_date {
                metrics.completed_tickets += 1;

                // Check if on-time (completed_date <= due_date)
                if completed <= &due_date {
                    metrics.on_time_tickets += 1;

                    // Check if early (completed more than 1 day before due)
                    // Simple string comparison works for YYYY-MM-DD format
                    if completed < &due_date {
                        metrics.early_deliveries += 1;
                    }
                } else {
                    metrics.late_tickets += 1;

                    // Check if critical ticket was late
                    if complexity == "critical" {
                        metrics.late_critical_tickets += 1;
                    }
                }

                // Calculate delivery time in days (simplified)
                // For now, just count completed tickets for average
                metrics.total_delivery_days += 1.0;
            }
        }

        // Count reopened tickets
        if reopen_count > 0 {
            metrics.reopened_tickets += 1;
        }
    }

    Ok(metrics)
}

/// Aggregate bug metrics for a developer in a specific month
fn aggregate_bug_metrics(
    conn: &rusqlite::Connection,
    developer_id: &str,
    month: i32,
    year: i32,
) -> Result<BugMetrics, String> {
    let mut metrics = BugMetrics::default();

    // Build date range for the month
    let start_date = format!("{:04}-{:02}-01", year, month);
    let end_date = if month == 12 {
        format!("{:04}-01-01", year + 1)
    } else {
        format!("{:04}-{:02}-01", year, month + 1)
    };

    // Query all bugs for this developer created in the given month
    // Using substr to extract YYYY-MM-DD from RFC3339 timestamps
    let mut stmt = conn
        .prepare(
            "SELECT bug_type, severity
             FROM bugs
             WHERE developer_id = ?1
               AND substr(created_at, 1, 10) >= ?2
               AND substr(created_at, 1, 10) < ?3",
        )
        .map_err(|e| format!("Failed to prepare bug query: {}", e))?;

    let rows = stmt
        .query_map([developer_id, &start_date, &end_date], |row| {
            Ok((
                row.get::<_, String>(0)?, // bug_type
                row.get::<_, String>(1)?, // severity
            ))
        })
        .map_err(|e| format!("Failed to query bugs: {}", e))?;

    for row in rows {
        let (bug_type, severity) = row.map_err(|e| format!("Failed to read bug row: {}", e))?;

        metrics.total_bugs += 1;

        match bug_type.as_str() {
            "developer_error" => {
                metrics.developer_error_bugs += 1;
                match severity.as_str() {
                    "critical" => metrics.dev_error_by_severity.critical += 1,
                    "high" => metrics.dev_error_by_severity.high += 1,
                    "medium" => metrics.dev_error_by_severity.medium += 1,
                    "low" => metrics.dev_error_by_severity.low += 1,
                    _ => {}
                }
            }
            "conceptual" => metrics.conceptual_bugs += 1,
            _ => metrics.other_bugs += 1,
        }
    }

    Ok(metrics)
}

/// Get previous KPI scores for trend calculation
fn get_previous_scores(
    conn: &rusqlite::Connection,
    developer_id: &str,
    current_month: i32,
    current_year: i32,
    num_months: usize,
) -> Result<Vec<f64>, String> {
    let mut scores = Vec::new();

    // Get up to num_months previous KPI records
    let mut stmt = conn
        .prepare(
            "SELECT overall_score
             FROM monthly_kpi
             WHERE developer_id = ?1
               AND (year < ?2 OR (year = ?2 AND month < ?3))
             ORDER BY year DESC, month DESC
             LIMIT ?4",
        )
        .map_err(|e| format!("Failed to prepare history query: {}", e))?;

    let rows = stmt
        .query_map(
            rusqlite::params![developer_id, current_year, current_month, num_months as i32],
            |row| row.get::<_, f64>(0),
        )
        .map_err(|e| format!("Failed to query history: {}", e))?;

    for row in rows {
        scores.push(row.map_err(|e| format!("Failed to read score: {}", e))?);
    }

    Ok(scores)
}

/// Generate monthly KPI for a developer
/// Aggregates all metrics and calculates scores
#[tauri::command]
pub fn generate_monthly_kpi(
    state: State<DbState>,
    developer_id: String,
    month: i32,
    year: i32,
) -> Result<MonthlyKPI, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Verify developer exists
    let _: String = conn
        .query_row(
            "SELECT id FROM developers WHERE id = ?1",
            [&developer_id],
            |row| row.get(0),
        )
        .map_err(|_| "Developer not found".to_string())?;

    // Aggregate metrics
    let ticket_metrics = aggregate_ticket_metrics(&conn, &developer_id, month, year)?;
    let bug_metrics = aggregate_bug_metrics(&conn, &developer_id, month, year)?;

    // Calculate scores using the KPI calculator service
    let config = KPIConfig::default();

    let delivery_metrics = DeliveryMetrics {
        completed_tickets: ticket_metrics.completed_tickets,
        on_time_tickets: ticket_metrics.on_time_tickets,
        early_deliveries: ticket_metrics.early_deliveries,
        late_critical_tickets: ticket_metrics.late_critical_tickets,
        reopened_tickets: ticket_metrics.reopened_tickets,
    };

    let delivery_score = calculate_delivery_score(&delivery_metrics);
    let quality_score = calculate_quality_score(
        &bug_metrics.dev_error_by_severity,
        bug_metrics.conceptual_bugs,
        &config,
    );
    let overall_score = calculate_overall_score(delivery_score, quality_score, &config);

    // Get previous scores for trend calculation
    let previous_scores = get_previous_scores(&conn, &developer_id, month, year, 3)?;
    let trend = calculate_trend(overall_score, &previous_scores);

    // Calculate on-time rate
    let on_time_rate = if ticket_metrics.completed_tickets > 0 {
        (ticket_metrics.on_time_tickets as f64 / ticket_metrics.completed_tickets as f64) * 100.0
    } else {
        100.0
    };

    // Calculate average delivery time (simplified - just days per ticket)
    let avg_delivery_time = if ticket_metrics.completed_tickets > 0 {
        ticket_metrics.total_delivery_days / ticket_metrics.completed_tickets as f64
    } else {
        0.0
    };

    let now = Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();

    // Check if KPI already exists for this month
    let existing_id: Option<String> = conn
        .query_row(
            "SELECT id FROM monthly_kpi WHERE developer_id = ?1 AND month = ?2 AND year = ?3",
            rusqlite::params![&developer_id, month, year],
            |row| row.get(0),
        )
        .ok();

    let final_id = if let Some(existing) = existing_id {
        // Update existing record
        conn.execute(
            "UPDATE monthly_kpi SET
                total_tickets = ?1,
                completed_tickets = ?2,
                on_time_tickets = ?3,
                late_tickets = ?4,
                reopened_tickets = ?5,
                on_time_rate = ?6,
                avg_delivery_time = ?7,
                total_bugs = ?8,
                developer_error_bugs = ?9,
                conceptual_bugs = ?10,
                other_bugs = ?11,
                delivery_score = ?12,
                quality_score = ?13,
                overall_score = ?14,
                trend = ?15,
                generated_at = ?16
             WHERE id = ?17",
            rusqlite::params![
                ticket_metrics.total_tickets,
                ticket_metrics.completed_tickets,
                ticket_metrics.on_time_tickets,
                ticket_metrics.late_tickets,
                ticket_metrics.reopened_tickets,
                on_time_rate,
                avg_delivery_time,
                bug_metrics.total_bugs,
                bug_metrics.developer_error_bugs,
                bug_metrics.conceptual_bugs,
                bug_metrics.other_bugs,
                delivery_score,
                quality_score,
                overall_score,
                trend.as_str(),
                &now,
                &existing,
            ],
        )
        .map_err(|e| format!("Failed to update KPI: {}", e))?;
        existing
    } else {
        // Insert new record
        conn.execute(
            "INSERT INTO monthly_kpi (
                id, developer_id, month, year,
                total_tickets, completed_tickets, on_time_tickets, late_tickets, reopened_tickets,
                on_time_rate, avg_delivery_time,
                total_bugs, developer_error_bugs, conceptual_bugs, other_bugs,
                delivery_score, quality_score, overall_score, trend, generated_at
             ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)",
            rusqlite::params![
                &id,
                &developer_id,
                month,
                year,
                ticket_metrics.total_tickets,
                ticket_metrics.completed_tickets,
                ticket_metrics.on_time_tickets,
                ticket_metrics.late_tickets,
                ticket_metrics.reopened_tickets,
                on_time_rate,
                avg_delivery_time,
                bug_metrics.total_bugs,
                bug_metrics.developer_error_bugs,
                bug_metrics.conceptual_bugs,
                bug_metrics.other_bugs,
                delivery_score,
                quality_score,
                overall_score,
                trend.as_str(),
                &now,
            ],
        )
        .map_err(|e| format!("Failed to insert KPI: {}", e))?;
        id
    };

    Ok(MonthlyKPI {
        id: final_id,
        developer_id,
        month,
        year,
        total_tickets: ticket_metrics.total_tickets,
        completed_tickets: ticket_metrics.completed_tickets,
        on_time_tickets: ticket_metrics.on_time_tickets,
        late_tickets: ticket_metrics.late_tickets,
        reopened_tickets: ticket_metrics.reopened_tickets,
        on_time_rate,
        avg_delivery_time,
        total_bugs: bug_metrics.total_bugs,
        developer_error_bugs: bug_metrics.developer_error_bugs,
        conceptual_bugs: bug_metrics.conceptual_bugs,
        other_bugs: bug_metrics.other_bugs,
        delivery_score,
        quality_score,
        overall_score,
        trend: Some(trend),
        generated_at: now,
    })
}

/// Get KPI history for a developer (all months)
#[tauri::command]
pub fn get_kpi_history(
    state: State<DbState>,
    developer_id: String,
) -> Result<Vec<MonthlyKPI>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT 
                id, developer_id, month, year,
                total_tickets, completed_tickets, on_time_tickets, late_tickets, reopened_tickets,
                on_time_rate, avg_delivery_time,
                total_bugs, developer_error_bugs, conceptual_bugs, other_bugs,
                delivery_score, quality_score, overall_score, trend, generated_at
             FROM monthly_kpi
             WHERE developer_id = ?1
             ORDER BY year DESC, month DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let rows = stmt
        .query_map([&developer_id], |row| {
            let trend_str: Option<String> = row.get(18)?;
            let trend = trend_str.and_then(|s| KPITrend::from_str(&s).ok());

            Ok(MonthlyKPI {
                id: row.get(0)?,
                developer_id: row.get(1)?,
                month: row.get(2)?,
                year: row.get(3)?,
                total_tickets: row.get(4)?,
                completed_tickets: row.get(5)?,
                on_time_tickets: row.get(6)?,
                late_tickets: row.get(7)?,
                reopened_tickets: row.get(8)?,
                on_time_rate: row.get(9)?,
                avg_delivery_time: row.get(10)?,
                total_bugs: row.get(11)?,
                developer_error_bugs: row.get(12)?,
                conceptual_bugs: row.get(13)?,
                other_bugs: row.get(14)?,
                delivery_score: row.get(15)?,
                quality_score: row.get(16)?,
                overall_score: row.get(17)?,
                trend,
                generated_at: row.get(19)?,
            })
        })
        .map_err(|e| format!("Failed to query KPI history: {}", e))?;

    let history: Result<Vec<_>, _> = rows.collect();
    history.map_err(|e| format!("Failed to collect KPI history: {}", e))
}

/// Get current month KPI (calculated on-the-fly, NOT stored)
/// This is used for real-time dashboard display
#[tauri::command]
pub fn get_current_month_kpi(
    state: State<DbState>,
    developer_id: String,
) -> Result<MonthlyKPI, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let now = Utc::now();
    let month = now.format("%m").to_string().parse::<i32>().unwrap_or(1);
    let year = now.format("%Y").to_string().parse::<i32>().unwrap_or(2024);

    // Verify developer exists
    let _: String = conn
        .query_row(
            "SELECT id FROM developers WHERE id = ?1",
            [&developer_id],
            |row| row.get(0),
        )
        .map_err(|_| "Developer not found".to_string())?;

    // Aggregate metrics (same as generate_monthly_kpi)
    let ticket_metrics = aggregate_ticket_metrics(&conn, &developer_id, month, year)?;
    let bug_metrics = aggregate_bug_metrics(&conn, &developer_id, month, year)?;

    // Calculate scores
    let config = KPIConfig::default();

    let delivery_metrics = DeliveryMetrics {
        completed_tickets: ticket_metrics.completed_tickets,
        on_time_tickets: ticket_metrics.on_time_tickets,
        early_deliveries: ticket_metrics.early_deliveries,
        late_critical_tickets: ticket_metrics.late_critical_tickets,
        reopened_tickets: ticket_metrics.reopened_tickets,
    };

    let delivery_score = calculate_delivery_score(&delivery_metrics);
    let quality_score = calculate_quality_score(
        &bug_metrics.dev_error_by_severity,
        bug_metrics.conceptual_bugs,
        &config,
    );
    let overall_score = calculate_overall_score(delivery_score, quality_score, &config);

    // Get previous scores for trend calculation
    let previous_scores = get_previous_scores(&conn, &developer_id, month, year, 3)?;
    let trend = calculate_trend(overall_score, &previous_scores);

    // Calculate rates
    let on_time_rate = if ticket_metrics.completed_tickets > 0 {
        (ticket_metrics.on_time_tickets as f64 / ticket_metrics.completed_tickets as f64) * 100.0
    } else {
        100.0
    };

    let avg_delivery_time = if ticket_metrics.completed_tickets > 0 {
        ticket_metrics.total_delivery_days / ticket_metrics.completed_tickets as f64
    } else {
        0.0
    };

    // Return without storing - use a temporary ID
    Ok(MonthlyKPI {
        id: format!("preview-{}-{}-{}", developer_id, year, month),
        developer_id,
        month,
        year,
        total_tickets: ticket_metrics.total_tickets,
        completed_tickets: ticket_metrics.completed_tickets,
        on_time_tickets: ticket_metrics.on_time_tickets,
        late_tickets: ticket_metrics.late_tickets,
        reopened_tickets: ticket_metrics.reopened_tickets,
        on_time_rate,
        avg_delivery_time,
        total_bugs: bug_metrics.total_bugs,
        developer_error_bugs: bug_metrics.developer_error_bugs,
        conceptual_bugs: bug_metrics.conceptual_bugs,
        other_bugs: bug_metrics.other_bugs,
        delivery_score,
        quality_score,
        overall_score,
        trend: Some(trend),
        generated_at: now.to_rfc3339(),
    })
}

/// Export monthly KPI as CSV
/// If developer_id is None, exports aggregated team data
#[tauri::command]
pub fn export_monthly_kpi_csv(
    state: State<DbState>,
    developer_id: Option<String>,
    month: i32,
    year: i32,
) -> Result<String, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Get KPI data - either from stored records or calculate on-the-fly
    let kpi = if let Some(dev_id) = developer_id {
        // Try to get stored KPI first
        let stored_kpi: Option<MonthlyKPI> = conn
            .query_row(
                "SELECT 
                    id, developer_id, month, year,
                    total_tickets, completed_tickets, on_time_tickets, late_tickets, reopened_tickets,
                    on_time_rate, avg_delivery_time,
                    total_bugs, developer_error_bugs, conceptual_bugs, other_bugs,
                    delivery_score, quality_score, overall_score, trend, generated_at
                 FROM monthly_kpi
                 WHERE developer_id = ?1 AND month = ?2 AND year = ?3",
                rusqlite::params![&dev_id, month, year],
                |row| {
                    let trend_str: Option<String> = row.get(18)?;
                    let trend = trend_str.and_then(|s| KPITrend::from_str(&s).ok());

                    Ok(MonthlyKPI {
                        id: row.get(0)?,
                        developer_id: row.get(1)?,
                        month: row.get(2)?,
                        year: row.get(3)?,
                        total_tickets: row.get(4)?,
                        completed_tickets: row.get(5)?,
                        on_time_tickets: row.get(6)?,
                        late_tickets: row.get(7)?,
                        reopened_tickets: row.get(8)?,
                        on_time_rate: row.get(9)?,
                        avg_delivery_time: row.get(10)?,
                        total_bugs: row.get(11)?,
                        developer_error_bugs: row.get(12)?,
                        conceptual_bugs: row.get(13)?,
                        other_bugs: row.get(14)?,
                        delivery_score: row.get(15)?,
                        quality_score: row.get(16)?,
                        overall_score: row.get(17)?,
                        trend,
                        generated_at: row.get(19)?,
                    })
                },
            )
            .ok();

        stored_kpi.unwrap_or_else(|| {
            // Calculate on-the-fly if not stored
            // Verify developer exists first
            if conn
                .query_row(
                    "SELECT id FROM developers WHERE id = ?1",
                    [&dev_id],
                    |row| row.get::<_, String>(0),
                )
                .is_err()
            {
                return MonthlyKPI {
                    id: format!("export-{}-{}-{}", dev_id, year, month),
                    developer_id: dev_id.clone(),
                    month,
                    year,
                    ..Default::default()
                };
            }

            // Aggregate metrics
            let ticket_metrics = aggregate_ticket_metrics(&conn, &dev_id, month, year)
                .unwrap_or_default();
            let bug_metrics = aggregate_bug_metrics(&conn, &dev_id, month, year)
                .unwrap_or_default();

            // Calculate scores
            let config = KPIConfig::default();
            let delivery_metrics = DeliveryMetrics {
                completed_tickets: ticket_metrics.completed_tickets,
                on_time_tickets: ticket_metrics.on_time_tickets,
                early_deliveries: ticket_metrics.early_deliveries,
                late_critical_tickets: ticket_metrics.late_critical_tickets,
                reopened_tickets: ticket_metrics.reopened_tickets,
            };

            let delivery_score = calculate_delivery_score(&delivery_metrics);
            let quality_score = calculate_quality_score(
                &bug_metrics.dev_error_by_severity,
                bug_metrics.conceptual_bugs,
                &config,
            );
            let overall_score = calculate_overall_score(delivery_score, quality_score, &config);

            let previous_scores = get_previous_scores(&conn, &dev_id, month, year, 3)
                .unwrap_or_default();
            let trend = calculate_trend(overall_score, &previous_scores);

            let on_time_rate = if ticket_metrics.completed_tickets > 0 {
                (ticket_metrics.on_time_tickets as f64 / ticket_metrics.completed_tickets as f64) * 100.0
            } else {
                100.0
            };

            let avg_delivery_time = if ticket_metrics.completed_tickets > 0 {
                ticket_metrics.total_delivery_days / ticket_metrics.completed_tickets as f64
            } else {
                0.0
            };

            MonthlyKPI {
                id: format!("export-{}-{}-{}", dev_id, year, month),
                developer_id: dev_id,
                month,
                year,
                total_tickets: ticket_metrics.total_tickets,
                completed_tickets: ticket_metrics.completed_tickets,
                on_time_tickets: ticket_metrics.on_time_tickets,
                late_tickets: ticket_metrics.late_tickets,
                reopened_tickets: ticket_metrics.reopened_tickets,
                on_time_rate,
                avg_delivery_time,
                total_bugs: bug_metrics.total_bugs,
                developer_error_bugs: bug_metrics.developer_error_bugs,
                conceptual_bugs: bug_metrics.conceptual_bugs,
                other_bugs: bug_metrics.other_bugs,
                delivery_score,
                quality_score,
                overall_score,
                trend: Some(trend),
                generated_at: Utc::now().to_rfc3339(),
            }
        })
    } else {
        // Aggregate for all active developers
        let active_devs: Vec<String> = conn
            .prepare("SELECT id FROM developers WHERE is_active = 1")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(0))
                    .and_then(|rows| rows.collect::<Result<Vec<_>, _>>())
            })
            .map_err(|e| format!("Failed to get active developers: {}", e))?;

        if active_devs.is_empty() {
            return Err("No active developers found".to_string());
        }

        // Calculate KPI for each developer and aggregate
        let mut total_tickets = 0;
        let mut completed_tickets = 0;
        let mut on_time_tickets = 0;
        let mut late_tickets = 0;
        let mut reopened_tickets = 0;
        let mut total_bugs = 0;
        let mut developer_error_bugs = 0;
        let mut conceptual_bugs = 0;
        let mut other_bugs = 0;
        let mut delivery_scores = Vec::new();
        let mut quality_scores = Vec::new();
        let mut overall_scores = Vec::new();
        let mut total_delivery_days = 0.0;

        for dev_id in &active_devs {
            let ticket_metrics = aggregate_ticket_metrics(&conn, dev_id, month, year)?;
            let bug_metrics = aggregate_bug_metrics(&conn, dev_id, month, year)?;

            total_tickets += ticket_metrics.total_tickets;
            completed_tickets += ticket_metrics.completed_tickets;
            on_time_tickets += ticket_metrics.on_time_tickets;
            late_tickets += ticket_metrics.late_tickets;
            reopened_tickets += ticket_metrics.reopened_tickets;
            total_delivery_days += ticket_metrics.total_delivery_days;

            total_bugs += bug_metrics.total_bugs;
            developer_error_bugs += bug_metrics.developer_error_bugs;
            conceptual_bugs += bug_metrics.conceptual_bugs;
            other_bugs += bug_metrics.other_bugs;

            let config = KPIConfig::default();
            let delivery_metrics = DeliveryMetrics {
                completed_tickets: ticket_metrics.completed_tickets,
                on_time_tickets: ticket_metrics.on_time_tickets,
                early_deliveries: ticket_metrics.early_deliveries,
                late_critical_tickets: ticket_metrics.late_critical_tickets,
                reopened_tickets: ticket_metrics.reopened_tickets,
            };

            delivery_scores.push(calculate_delivery_score(&delivery_metrics));
            quality_scores.push(calculate_quality_score(
                &bug_metrics.dev_error_by_severity,
                bug_metrics.conceptual_bugs,
                &config,
            ));
            overall_scores.push(calculate_overall_score(
                delivery_scores.last().copied().unwrap_or(0.0),
                quality_scores.last().copied().unwrap_or(0.0),
                &config,
            ));
        }

        let avg_delivery_score = if !delivery_scores.is_empty() {
            delivery_scores.iter().sum::<f64>() / delivery_scores.len() as f64
        } else {
            0.0
        };

        let avg_quality_score = if !quality_scores.is_empty() {
            quality_scores.iter().sum::<f64>() / quality_scores.len() as f64
        } else {
            0.0
        };

        let avg_overall_score = if !overall_scores.is_empty() {
            overall_scores.iter().sum::<f64>() / overall_scores.len() as f64
        } else {
            0.0
        };

        let on_time_rate = if completed_tickets > 0 {
            (on_time_tickets as f64 / completed_tickets as f64) * 100.0
        } else {
            100.0
        };

        let avg_delivery_time = if completed_tickets > 0 {
            total_delivery_days / completed_tickets as f64
        } else {
            0.0
        };

        MonthlyKPI {
            id: format!("team-{}-{}", year, month),
            developer_id: "all".to_string(),
            month,
            year,
            total_tickets,
            completed_tickets,
            on_time_tickets,
            late_tickets,
            reopened_tickets,
            on_time_rate,
            avg_delivery_time,
            total_bugs,
            developer_error_bugs,
            conceptual_bugs,
            other_bugs,
            delivery_score: avg_delivery_score,
            quality_score: avg_quality_score,
            overall_score: avg_overall_score,
            trend: None,
            generated_at: Utc::now().to_rfc3339(),
        }
    };

    // Generate CSV content
    let month_names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    let mut csv = String::new();
    csv.push_str("KPI Report\n");
    csv.push_str(&format!("Period: {} {}\n", month_names[month as usize - 1], year));
    csv.push_str(&format!("Developer: {}\n", if kpi.developer_id == "all" { "All Developers (Team)" } else { &kpi.developer_id }));
    csv.push_str(&format!("Generated: {}\n\n", kpi.generated_at));

    csv.push_str("Metric,Value\n");
    csv.push_str(&format!("Total Tickets,{}\n", kpi.total_tickets));
    csv.push_str(&format!("Completed Tickets,{}\n", kpi.completed_tickets));
    csv.push_str(&format!("On-Time Tickets,{}\n", kpi.on_time_tickets));
    csv.push_str(&format!("Late Tickets,{}\n", kpi.late_tickets));
    csv.push_str(&format!("Reopened Tickets,{}\n", kpi.reopened_tickets));
    csv.push_str(&format!("On-Time Rate,{:.2}%\n", kpi.on_time_rate));
    csv.push_str(&format!("Avg Delivery Time,{:.2} days\n", kpi.avg_delivery_time));
    csv.push_str(&format!("Total Bugs,{}\n", kpi.total_bugs));
    csv.push_str(&format!("Developer Error Bugs,{}\n", kpi.developer_error_bugs));
    csv.push_str(&format!("Conceptual Bugs,{}\n", kpi.conceptual_bugs));
    csv.push_str(&format!("Other Bugs,{}\n", kpi.other_bugs));
    csv.push_str(&format!("Delivery Score,{:.2}%\n", kpi.delivery_score));
    csv.push_str(&format!("Quality Score,{:.2}%\n", kpi.quality_score));
    csv.push_str(&format!("Overall Score,{:.2}%\n", kpi.overall_score));
    if let Some(trend) = &kpi.trend {
        csv.push_str(&format!("Trend,{}\n", trend.as_str()));
    }

    Ok(csv)
}
