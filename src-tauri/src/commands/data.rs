// Data Management Commands - Backup, Restore, Export, Import, Clear

use crate::db::DbState;
use crate::models::{Bug, Developer, MonthlyKPI, Ticket};
use chrono::Utc;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, State};

/// Exported data structure
#[derive(Debug, Serialize, Deserialize)]
pub struct ExportedData {
    pub version: String,
    pub exported_at: String,
    pub developers: Vec<Developer>,
    pub tickets: Vec<Ticket>,
    pub bugs: Vec<Bug>,
    pub monthly_kpi: Vec<MonthlyKPI>,
}

/// Export all data to JSON
#[tauri::command]
pub fn export_all_data(state: State<DbState>) -> Result<String, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Fetch all developers
    let mut stmt = conn
        .prepare(
            "SELECT id, name, email, role, team, start_date, is_active, created_at, updated_at
             FROM developers
             ORDER BY name ASC",
        )
        .map_err(|e| format!("Failed to prepare developers query: {}", e))?;

    let developers: Vec<Developer> = stmt
        .query_map([], |row| {
            use crate::models::DeveloperRole;
            let role_str: String = row.get(3)?;
            Ok(Developer {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                role: DeveloperRole::from_str(&role_str).unwrap_or(DeveloperRole::Junior),
                team: row.get(4)?,
                start_date: row.get(5)?,
                is_active: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| format!("Failed to query developers: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect developers: {}", e))?;

    // Fetch all tickets
    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, developer_id, assigned_date, due_date, completed_date, 
                    status, estimated_hours, actual_hours, complexity, reopen_count, created_at, updated_at
             FROM tickets
             ORDER BY created_at ASC",
        )
        .map_err(|e| format!("Failed to prepare tickets query: {}", e))?;

    let tickets: Vec<Ticket> = stmt
        .query_map([], |row| {
            use crate::commands::tickets::parse_ticket_row;
            parse_ticket_row(row)
        })
        .map_err(|e| format!("Failed to query tickets: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect tickets: {}", e))?;

    // Fetch all bugs
    let mut stmt = conn
        .prepare(
            "SELECT id, ticket_id, developer_id, reported_by, title, description, 
                    severity, bug_type, is_resolved, resolved_date,
                    resolved_by_developer_id, fix_ticket_id, created_at, updated_at
             FROM bugs
             ORDER BY created_at ASC",
        )
        .map_err(|e| format!("Failed to prepare bugs query: {}", e))?;

    let bugs: Vec<Bug> = stmt
        .query_map([], |row| {
            use crate::commands::bugs::parse_bug_row;
            parse_bug_row(row)
        })
        .map_err(|e| format!("Failed to query bugs: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect bugs: {}", e))?;

    // Fetch all monthly KPIs
    let mut stmt = conn
        .prepare(
            "SELECT id, developer_id, month, year, total_tickets, completed_tickets, 
                    on_time_tickets, late_tickets, reopened_tickets, on_time_rate, 
                    avg_delivery_time, total_bugs, developer_error_bugs, conceptual_bugs, 
                    other_bugs, delivery_score, quality_score, overall_score, trend, generated_at
             FROM monthly_kpi
             ORDER BY year DESC, month DESC",
        )
        .map_err(|e| format!("Failed to prepare monthly_kpi query: {}", e))?;

    let monthly_kpi: Vec<MonthlyKPI> = stmt
        .query_map([], |row| {
            use crate::models::KPITrend;
            let trend_str: Option<String> = row.get(18)?;
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
                trend: trend_str
                    .as_ref()
                    .and_then(|s| KPITrend::from_str(s).ok()),
                generated_at: row.get(19)?,
            })
        })
        .map_err(|e| format!("Failed to query monthly_kpi: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect monthly_kpi: {}", e))?;

    // Create export structure
    let exported_data = ExportedData {
        version: "1.0".to_string(),
        exported_at: Utc::now().to_rfc3339(),
        developers,
        tickets,
        bugs,
        monthly_kpi,
    };

    // Serialize to JSON
    serde_json::to_string_pretty(&exported_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))
}

/// Import data from JSON
#[tauri::command]
pub fn import_data(state: State<DbState>, json_data: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Parse JSON
    let data: ExportedData = serde_json::from_str(&json_data)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;

    // Start transaction
    let tx = conn
        .unchecked_transaction()
        .map_err(|e| format!("Failed to start transaction: {}", e))?;

    // Clear existing data (in reverse order of foreign keys)
    tx.execute("DELETE FROM monthly_kpi", [])
        .map_err(|e| format!("Failed to clear monthly_kpi: {}", e))?;
    tx.execute("DELETE FROM bugs", [])
        .map_err(|e| format!("Failed to clear bugs: {}", e))?;
    tx.execute("DELETE FROM tickets", [])
        .map_err(|e| format!("Failed to clear tickets: {}", e))?;
    tx.execute("DELETE FROM developers", [])
        .map_err(|e| format!("Failed to clear developers: {}", e))?;

    // Import developers
    for dev in &data.developers {
        tx.execute(
            "INSERT INTO developers (id, name, email, role, team, start_date, is_active, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                dev.id,
                dev.name,
                dev.email,
                dev.role.as_str(),
                dev.team,
                dev.start_date,
                dev.is_active,
                dev.created_at,
                dev.updated_at
            ],
        )
        .map_err(|e| format!("Failed to import developer {}: {}", dev.id, e))?;
    }

    // Import tickets
    for ticket in &data.tickets {
        tx.execute(
            "INSERT INTO tickets (id, title, description, developer_id, assigned_date, due_date, 
                    completed_date, status, estimated_hours, actual_hours, complexity, reopen_count, 
                    created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
            params![
                ticket.id,
                ticket.title,
                ticket.description,
                ticket.developer_id,
                ticket.assigned_date,
                ticket.due_date,
                ticket.completed_date,
                ticket.status.as_str(),
                ticket.estimated_hours,
                ticket.actual_hours,
                ticket.complexity.as_str(),
                ticket.reopen_count,
                ticket.created_at,
                ticket.updated_at
            ],
        )
        .map_err(|e| format!("Failed to import ticket {}: {}", ticket.id, e))?;
    }

    // Import bugs
    for bug in &data.bugs {
        tx.execute(
            "INSERT INTO bugs (id, ticket_id, developer_id, reported_by, title, description, 
                    severity, bug_type, is_resolved, resolved_date, 
                    resolved_by_developer_id, fix_ticket_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
            params![
                bug.id,
                bug.ticket_id,
                bug.developer_id,
                bug.reported_by,
                bug.title,
                bug.description,
                bug.severity.as_str(),
                bug.bug_type.as_str(),
                bug.is_resolved,
                bug.resolved_date,
                bug.resolved_by_developer_id,
                bug.fix_ticket_id,
                bug.created_at,
                bug.updated_at
            ],
        )
        .map_err(|e| format!("Failed to import bug {}: {}", bug.id, e))?;
    }

    // Import monthly KPIs
    for kpi in &data.monthly_kpi {
        let trend_str = kpi.trend.as_ref().map(|t| t.as_str());
        tx.execute(
            "INSERT INTO monthly_kpi (id, developer_id, month, year, total_tickets, completed_tickets, 
                    on_time_tickets, late_tickets, reopened_tickets, on_time_rate, 
                    avg_delivery_time, total_bugs, developer_error_bugs, conceptual_bugs, 
                    other_bugs, delivery_score, quality_score, overall_score, trend, generated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)",
            params![
                kpi.id,
                kpi.developer_id,
                kpi.month,
                kpi.year,
                kpi.total_tickets,
                kpi.completed_tickets,
                kpi.on_time_tickets,
                kpi.late_tickets,
                kpi.reopened_tickets,
                kpi.on_time_rate,
                kpi.avg_delivery_time,
                kpi.total_bugs,
                kpi.developer_error_bugs,
                kpi.conceptual_bugs,
                kpi.other_bugs,
                kpi.delivery_score,
                kpi.quality_score,
                kpi.overall_score,
                trend_str,
                kpi.generated_at
            ],
        )
        .map_err(|e| format!("Failed to import monthly_kpi {}: {}", kpi.id, e))?;
    }

    // Commit transaction
    tx.commit()
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;

    Ok(())
}

/// Clear all data (with confirmation - handled on frontend)
#[tauri::command]
pub fn clear_all_data(state: State<DbState>) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Start transaction
    let tx = conn
        .unchecked_transaction()
        .map_err(|e| format!("Failed to start transaction: {}", e))?;

    // Clear all data (in reverse order of foreign keys)
    tx.execute("DELETE FROM monthly_kpi", [])
        .map_err(|e| format!("Failed to clear monthly_kpi: {}", e))?;
    tx.execute("DELETE FROM bugs", [])
        .map_err(|e| format!("Failed to clear bugs: {}", e))?;
    tx.execute("DELETE FROM tickets", [])
        .map_err(|e| format!("Failed to clear tickets: {}", e))?;
    tx.execute("DELETE FROM developers", [])
        .map_err(|e| format!("Failed to clear developers: {}", e))?;

    // Commit transaction
    tx.commit()
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;

    Ok(())
}

/// Backup database (copy SQLite file)
#[tauri::command]
pub fn backup_database() -> Result<String, String> {
    use crate::db::{get_app_data_dir, get_db_path};
    use std::fs;

    let db_path = get_db_path();
    if !db_path.exists() {
        return Err("Database file does not exist".to_string());
    }

    let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
    let backup_path = get_app_data_dir().join(format!("kpi_backup_{}.db", timestamp));

    fs::copy(&db_path, &backup_path)
        .map_err(|e| format!("Failed to copy database: {}", e))?;

    backup_path
        .to_str()
        .ok_or_else(|| "Invalid backup path".to_string())
        .map(|s| s.to_string())
}

/// Restore database from backup file
#[tauri::command]
pub fn restore_database(backup_path: String) -> Result<(), String> {
    use crate::db::{get_app_data_dir, get_db_path};
    use std::fs;

    let backup_path = PathBuf::from(backup_path);
    if !backup_path.exists() {
        return Err("Backup file does not exist".to_string());
    }

    let db_path = get_db_path();
    let app_dir = get_app_data_dir();

    // Ensure app directory exists
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| format!("Failed to create app directory: {}", e))?;
    }

    // Copy backup to database location
    fs::copy(&backup_path, &db_path)
        .map_err(|e| format!("Failed to restore database: {}", e))?;

    Ok(())
}

/// Restart the application
#[tauri::command]
pub fn restart_app(app: AppHandle) -> Result<(), String> {
    app.restart();
    Ok(())
}

