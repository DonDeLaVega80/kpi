use crate::db::DbState;
use crate::models::{Bug, BugSeverity, BugType, CreateBugInput, UpdateBugInput};
use chrono::Utc;
use tauri::State;
use uuid::Uuid;

/// Helper to parse a bug from a database row
fn parse_bug_row(row: &rusqlite::Row) -> Result<Bug, rusqlite::Error> {
    let severity_str: String = row.get(6)?;
    let bug_type_str: String = row.get(7)?;
    Ok(Bug {
        id: row.get(0)?,
        ticket_id: row.get(1)?,
        developer_id: row.get(2)?,
        reported_by: row.get(3)?,
        title: row.get(4)?,
        description: row.get(5)?,
        severity: BugSeverity::from_str(&severity_str).unwrap_or(BugSeverity::Medium),
        bug_type: BugType::from_str(&bug_type_str).unwrap_or(BugType::DeveloperError),
        is_resolved: row.get(8)?,
        resolved_date: row.get(9)?,
        created_at: row.get(10)?,
        updated_at: row.get(11)?,
    })
}

/// Get a bug by ID (internal helper)
fn get_bug_by_id_internal(conn: &rusqlite::Connection, id: &str) -> Result<Bug, String> {
    conn.query_row(
        "SELECT id, ticket_id, developer_id, reported_by, title, description, 
                severity, bug_type, is_resolved, resolved_date, created_at, updated_at
         FROM bugs
         WHERE id = ?1",
        [id],
        |row| parse_bug_row(row),
    )
    .map_err(|e| format!("Bug not found: {}", e))
}

/// Create a new bug
#[tauri::command]
pub fn create_bug(state: State<DbState>, input: CreateBugInput) -> Result<Bug, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Validate severity and bug_type
    let severity = BugSeverity::from_str(&input.severity)?;
    let bug_type = BugType::from_str(&input.bug_type)?;

    // Verify ticket exists and get developer_id from ticket
    let developer_id: String = conn
        .query_row(
            "SELECT developer_id FROM tickets WHERE id = ?1",
            [&input.ticket_id],
            |row| row.get(0),
        )
        .map_err(|_| "Ticket not found".to_string())?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO bugs (id, ticket_id, developer_id, reported_by, title, description, severity, bug_type, is_resolved, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        (
            &id,
            &input.ticket_id,
            &developer_id,
            &input.reported_by,
            &input.title,
            &input.description,
            severity.as_str(),
            bug_type.as_str(),
            false,
            &now,
            &now,
        ),
    )
    .map_err(|e| format!("Failed to create bug: {}", e))?;

    Ok(Bug {
        id,
        ticket_id: input.ticket_id,
        developer_id,
        reported_by: input.reported_by,
        title: input.title,
        description: input.description,
        severity,
        bug_type,
        is_resolved: false,
        resolved_date: None,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Get all bugs
#[tauri::command]
pub fn get_all_bugs(state: State<DbState>) -> Result<Vec<Bug>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, ticket_id, developer_id, reported_by, title, description, 
                    severity, bug_type, is_resolved, resolved_date, created_at, updated_at
             FROM bugs
             ORDER BY created_at DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let bugs = stmt
        .query_map([], |row| parse_bug_row(row))
        .map_err(|e| format!("Failed to query bugs: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect bugs: {}", e))?;

    Ok(bugs)
}

/// Get all bugs for a ticket
#[tauri::command]
pub fn get_bugs_by_ticket(
    state: State<DbState>,
    ticket_id: String,
) -> Result<Vec<Bug>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, ticket_id, developer_id, reported_by, title, description, 
                    severity, bug_type, is_resolved, resolved_date, created_at, updated_at
             FROM bugs
             WHERE ticket_id = ?1
             ORDER BY created_at DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let bugs = stmt
        .query_map([&ticket_id], |row| parse_bug_row(row))
        .map_err(|e| format!("Failed to query bugs: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect bugs: {}", e))?;

    Ok(bugs)
}

/// Get all bugs for a developer
#[tauri::command]
pub fn get_bugs_by_developer(
    state: State<DbState>,
    developer_id: String,
) -> Result<Vec<Bug>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, ticket_id, developer_id, reported_by, title, description, 
                    severity, bug_type, is_resolved, resolved_date, created_at, updated_at
             FROM bugs
             WHERE developer_id = ?1
             ORDER BY created_at DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let bugs = stmt
        .query_map([&developer_id], |row| parse_bug_row(row))
        .map_err(|e| format!("Failed to query bugs: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect bugs: {}", e))?;

    Ok(bugs)
}

/// Update a bug
#[tauri::command]
pub fn update_bug(state: State<DbState>, input: UpdateBugInput) -> Result<Bug, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Get current bug
    let current = get_bug_by_id_internal(&conn, &input.id)?;

    // Apply updates
    let title = input.title.unwrap_or(current.title);
    let description = input.description.or(current.description);
    let severity = match input.severity {
        Some(s) => BugSeverity::from_str(&s)?,
        None => current.severity,
    };
    let bug_type = match input.bug_type {
        Some(bt) => BugType::from_str(&bt)?,
        None => current.bug_type,
    };
    let is_resolved = input.is_resolved.unwrap_or(current.is_resolved);
    let now = Utc::now().to_rfc3339();

    // If resolving, set resolved_date
    let resolved_date = if is_resolved && !current.is_resolved {
        Some(Utc::now().format("%Y-%m-%d").to_string())
    } else if !is_resolved {
        None
    } else {
        current.resolved_date
    };

    conn.execute(
        "UPDATE bugs
         SET title = ?1, description = ?2, severity = ?3, bug_type = ?4, is_resolved = ?5, resolved_date = ?6, updated_at = ?7
         WHERE id = ?8",
        (
            &title,
            &description,
            severity.as_str(),
            bug_type.as_str(),
            is_resolved,
            &resolved_date,
            &now,
            &input.id,
        ),
    )
    .map_err(|e| format!("Failed to update bug: {}", e))?;

    Ok(Bug {
        id: input.id,
        ticket_id: current.ticket_id,
        developer_id: current.developer_id,
        reported_by: current.reported_by,
        title,
        description,
        severity,
        bug_type,
        is_resolved,
        resolved_date,
        created_at: current.created_at,
        updated_at: now,
    })
}

/// Resolve a bug
#[tauri::command]
pub fn resolve_bug(state: State<DbState>, id: String) -> Result<Bug, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Get current bug
    let current = get_bug_by_id_internal(&conn, &id)?;

    if current.is_resolved {
        return Err("Bug is already resolved".to_string());
    }

    let now = Utc::now().to_rfc3339();
    let today = Utc::now().format("%Y-%m-%d").to_string();

    conn.execute(
        "UPDATE bugs SET is_resolved = TRUE, resolved_date = ?1, updated_at = ?2 WHERE id = ?3",
        (&today, &now, &id),
    )
    .map_err(|e| format!("Failed to resolve bug: {}", e))?;

    Ok(Bug {
        id,
        ticket_id: current.ticket_id,
        developer_id: current.developer_id,
        reported_by: current.reported_by,
        title: current.title,
        description: current.description,
        severity: current.severity,
        bug_type: current.bug_type,
        is_resolved: true,
        resolved_date: Some(today),
        created_at: current.created_at,
        updated_at: now,
    })
}
