use crate::db::DbState;
use crate::models::{CreateDeveloperInput, Developer, DeveloperRole, UpdateDeveloperInput};
use chrono::Utc;
use tauri::State;
use uuid::Uuid;

/// Create a new developer
#[tauri::command]
pub fn create_developer(
    state: State<DbState>,
    input: CreateDeveloperInput,
) -> Result<Developer, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Validate role
    let role = DeveloperRole::from_str(&input.role)?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO developers (id, name, email, role, team, start_date, is_active, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        (
            &id,
            &input.name,
            &input.email,
            role.as_str(),
            &input.team,
            &input.start_date,
            true,
            &now,
            &now,
        ),
    )
    .map_err(|e| {
        let error_msg = e.to_string();
        if error_msg.contains("UNIQUE constraint") || error_msg.contains("unique constraint") {
            format!("A developer with this email already exists. Please use a different email address.")
        } else if error_msg.contains("NOT NULL constraint") || error_msg.contains("NOT NULL") {
            format!("Required fields are missing. Please fill in all required information.")
        } else {
            format!("Failed to create developer. Please check your input and try again.")
        }
    })?;

    Ok(Developer {
        id,
        name: input.name,
        email: input.email,
        role,
        team: input.team,
        start_date: input.start_date,
        is_active: true,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Get all developers (optionally filter by active status)
#[tauri::command]
pub fn get_all_developers(state: State<DbState>) -> Result<Vec<Developer>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, email, role, team, start_date, is_active, created_at, updated_at
             FROM developers
             ORDER BY name ASC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let developers = stmt
        .query_map([], |row| {
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

    Ok(developers)
}

/// Get a developer by ID
#[tauri::command]
pub fn get_developer_by_id(state: State<DbState>, id: String) -> Result<Developer, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let developer = conn
        .query_row(
            "SELECT id, name, email, role, team, start_date, is_active, created_at, updated_at
             FROM developers
             WHERE id = ?1",
            [&id],
            |row| {
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
            },
        )
        .map_err(|e| format!("Developer not found: {}", e))?;

    Ok(developer)
}

/// Update a developer
#[tauri::command]
pub fn update_developer(
    state: State<DbState>,
    input: UpdateDeveloperInput,
) -> Result<Developer, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // First, get the current developer
    let current = conn
        .query_row(
            "SELECT id, name, email, role, team, start_date, is_active, created_at, updated_at
             FROM developers
             WHERE id = ?1",
            [&input.id],
            |row| {
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
            },
        )
        .map_err(|e| format!("Developer not found: {}", e))?;

    // Apply updates
    let name = input.name.unwrap_or(current.name);
    let email = input.email.unwrap_or(current.email);
    let role = match input.role {
        Some(r) => DeveloperRole::from_str(&r)?,
        None => current.role,
    };
    let team = input.team.or(current.team);
    let is_active = input.is_active.unwrap_or(current.is_active);
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE developers
         SET name = ?1, email = ?2, role = ?3, team = ?4, is_active = ?5, updated_at = ?6
         WHERE id = ?7",
        (
            &name,
            &email,
            role.as_str(),
            &team,
            is_active,
            &now,
            &input.id,
        ),
    )
    .map_err(|e| format!("Failed to update developer: {}", e))?;

    Ok(Developer {
        id: input.id,
        name,
        email,
        role,
        team,
        start_date: current.start_date,
        is_active,
        created_at: current.created_at,
        updated_at: now,
    })
}

/// Delete a developer (soft delete - sets is_active to false)
#[tauri::command]
pub fn delete_developer(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let now = Utc::now().to_rfc3339();

    let rows_affected = conn
        .execute(
            "UPDATE developers SET is_active = FALSE, updated_at = ?1 WHERE id = ?2",
            (&now, &id),
        )
        .map_err(|e| format!("Failed to delete developer: {}", e))?;

    if rows_affected == 0 {
        return Err("Developer not found".to_string());
    }

    Ok(())
}
