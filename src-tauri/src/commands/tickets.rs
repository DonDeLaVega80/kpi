use crate::db::DbState;
use crate::models::{CreateTicketInput, Ticket, TicketComplexity, TicketStatus, UpdateTicketInput};
use chrono::{NaiveDate, Utc};
use tauri::State;
use uuid::Uuid;

/// Helper to parse a ticket from a database row
pub fn parse_ticket_row(row: &rusqlite::Row) -> Result<Ticket, rusqlite::Error> {
    let status_str: String = row.get(7)?;
    let complexity_str: String = row.get(10)?;
    Ok(Ticket {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        developer_id: row.get(3)?,
        assigned_date: row.get(4)?,
        due_date: row.get(5)?,
        completed_date: row.get(6)?,
        status: TicketStatus::from_str(&status_str).unwrap_or(TicketStatus::Assigned),
        estimated_hours: row.get(8)?,
        actual_hours: row.get(9)?,
        complexity: TicketComplexity::from_str(&complexity_str).unwrap_or(TicketComplexity::Medium),
        reopen_count: row.get(11)?,
        created_at: row.get(12)?,
        updated_at: row.get(13)?,
    })
}

/// Create a new ticket
#[tauri::command]
pub fn create_ticket(
    state: State<DbState>,
    input: CreateTicketInput,
) -> Result<Ticket, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Validate complexity
    let complexity = TicketComplexity::from_str(&input.complexity)?;

    // Verify developer exists
    let developer_exists: bool = conn
        .query_row(
            "SELECT COUNT(*) > 0 FROM developers WHERE id = ?1 AND is_active = TRUE",
            [&input.developer_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Failed to verify developer: {}", e))?;

    if !developer_exists {
        return Err("Developer not found or inactive".to_string());
    }

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let today = Utc::now().format("%Y-%m-%d").to_string();

    conn.execute(
        "INSERT INTO tickets (id, title, description, developer_id, assigned_date, due_date, status, estimated_hours, complexity, reopen_count, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        (
            &id,
            &input.title,
            &input.description,
            &input.developer_id,
            &today,
            &input.due_date,
            TicketStatus::Assigned.as_str(),
            &input.estimated_hours,
            complexity.as_str(),
            0,
            &now,
            &now,
        ),
    )
    .map_err(|e| format!("Failed to create ticket: {}", e))?;

    Ok(Ticket {
        id,
        title: input.title,
        description: input.description,
        developer_id: input.developer_id,
        assigned_date: today,
        due_date: input.due_date,
        completed_date: None,
        status: TicketStatus::Assigned,
        estimated_hours: input.estimated_hours,
        actual_hours: None,
        complexity,
        reopen_count: 0,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Get all tickets
#[tauri::command]
pub fn get_all_tickets(state: State<DbState>) -> Result<Vec<Ticket>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, developer_id, assigned_date, due_date, completed_date, 
                    status, estimated_hours, actual_hours, complexity, reopen_count, created_at, updated_at
             FROM tickets
             ORDER BY due_date ASC, created_at DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let tickets = stmt
        .query_map([], |row| parse_ticket_row(row))
        .map_err(|e| format!("Failed to query tickets: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect tickets: {}", e))?;

    Ok(tickets)
}

/// Get tickets by developer
#[tauri::command]
pub fn get_tickets_by_developer(
    state: State<DbState>,
    developer_id: String,
) -> Result<Vec<Ticket>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, developer_id, assigned_date, due_date, completed_date, 
                    status, estimated_hours, actual_hours, complexity, reopen_count, created_at, updated_at
             FROM tickets
             WHERE developer_id = ?1
             ORDER BY due_date ASC, created_at DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let tickets = stmt
        .query_map([&developer_id], |row| parse_ticket_row(row))
        .map_err(|e| format!("Failed to query tickets: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect tickets: {}", e))?;

    Ok(tickets)
}

/// Get a ticket by ID
fn get_ticket_by_id_internal(
    conn: &rusqlite::Connection,
    id: &str,
) -> Result<Ticket, String> {
    conn.query_row(
        "SELECT id, title, description, developer_id, assigned_date, due_date, completed_date, 
                status, estimated_hours, actual_hours, complexity, reopen_count, created_at, updated_at
         FROM tickets
         WHERE id = ?1",
        [id],
        |row| parse_ticket_row(row),
    )
    .map_err(|e| format!("Ticket not found: {}", e))
}

/// Update a ticket
#[tauri::command]
pub fn update_ticket(
    state: State<DbState>,
    input: UpdateTicketInput,
) -> Result<Ticket, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Get current ticket
    let current = get_ticket_by_id_internal(&conn, &input.id)?;

    // Apply updates
    let title = input.title.unwrap_or(current.title);
    let description = input.description.or(current.description);
    let developer_id = input.developer_id.unwrap_or(current.developer_id);
    let due_date = input.due_date.unwrap_or(current.due_date);
    let status = match input.status {
        Some(s) => TicketStatus::from_str(&s)?,
        None => current.status,
    };
    let actual_hours = input.actual_hours.or(current.actual_hours);
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE tickets
         SET title = ?1, description = ?2, developer_id = ?3, due_date = ?4, status = ?5, actual_hours = ?6, updated_at = ?7
         WHERE id = ?8",
        (
            &title,
            &description,
            &developer_id,
            &due_date,
            status.as_str(),
            &actual_hours,
            &now,
            &input.id,
        ),
    )
    .map_err(|e| format!("Failed to update ticket: {}", e))?;

    Ok(Ticket {
        id: input.id,
        title,
        description,
        developer_id,
        assigned_date: current.assigned_date,
        due_date,
        completed_date: current.completed_date,
        status,
        estimated_hours: current.estimated_hours,
        actual_hours,
        complexity: current.complexity,
        reopen_count: current.reopen_count,
        created_at: current.created_at,
        updated_at: now,
    })
}

/// Update ticket status
#[tauri::command]
pub fn update_ticket_status(
    state: State<DbState>,
    id: String,
    status: String,
) -> Result<Ticket, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let new_status = TicketStatus::from_str(&status)?;
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE tickets SET status = ?1, updated_at = ?2 WHERE id = ?3",
        (new_status.as_str(), &now, &id),
    )
    .map_err(|e| format!("Failed to update ticket status: {}", e))?;

    get_ticket_by_id_internal(&conn, &id)
}

/// Complete a ticket (auto-calculates if on time, accumulates actual hours)
#[tauri::command]
pub fn complete_ticket(
    state: State<DbState>,
    id: String,
    actual_hours: Option<f64>,
) -> Result<Ticket, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Get current ticket
    let current = get_ticket_by_id_internal(&conn, &id)?;

    let now = Utc::now().to_rfc3339();
    let today = Utc::now().format("%Y-%m-%d").to_string();

    // Check if completed on time
    let due_date = NaiveDate::parse_from_str(&current.due_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid due date format: {}", e))?;
    let completed_date = NaiveDate::parse_from_str(&today, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    let _was_on_time = completed_date <= due_date;

    // Accumulate actual hours: add new hours to existing hours
    let total_actual_hours = match (actual_hours, current.actual_hours) {
        (Some(new), Some(existing)) => Some(existing + new),  // Add to existing
        (Some(new), None) => Some(new),                        // First time completing
        (None, existing) => existing,                          // Keep existing if no new hours provided
    };

    conn.execute(
        "UPDATE tickets SET status = ?1, completed_date = ?2, actual_hours = ?3, updated_at = ?4 WHERE id = ?5",
        (
            TicketStatus::Completed.as_str(),
            &today,
            &total_actual_hours,
            &now,
            &id,
        ),
    )
    .map_err(|e| format!("Failed to complete ticket: {}", e))?;

    Ok(Ticket {
        id,
        title: current.title,
        description: current.description,
        developer_id: current.developer_id,
        assigned_date: current.assigned_date,
        due_date: current.due_date,
        completed_date: Some(today),
        status: TicketStatus::Completed,
        estimated_hours: current.estimated_hours,
        actual_hours: total_actual_hours,
        complexity: current.complexity,
        reopen_count: current.reopen_count,
        created_at: current.created_at,
        updated_at: now,
    })
}

/// Reopen a ticket (increments reopen count)
#[tauri::command]
pub fn reopen_ticket(state: State<DbState>, id: String) -> Result<Ticket, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Get current ticket
    let current = get_ticket_by_id_internal(&conn, &id)?;

    let now = Utc::now().to_rfc3339();
    let new_reopen_count = current.reopen_count + 1;

    conn.execute(
        "UPDATE tickets SET status = ?1, reopen_count = ?2, completed_date = NULL, updated_at = ?3 WHERE id = ?4",
        (
            TicketStatus::Reopened.as_str(),
            new_reopen_count,
            &now,
            &id,
        ),
    )
    .map_err(|e| format!("Failed to reopen ticket: {}", e))?;

    Ok(Ticket {
        id,
        title: current.title,
        description: current.description,
        developer_id: current.developer_id,
        assigned_date: current.assigned_date,
        due_date: current.due_date,
        completed_date: None,
        status: TicketStatus::Reopened,
        estimated_hours: current.estimated_hours,
        actual_hours: current.actual_hours,
        complexity: current.complexity,
        reopen_count: new_reopen_count,
        created_at: current.created_at,
        updated_at: now,
    })
}
