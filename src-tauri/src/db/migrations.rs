use rusqlite::Connection;

/// Run all database migrations
pub fn run_migrations(conn: &Connection) -> Result<(), String> {
    // Create migrations table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )
    .map_err(|e| format!("Failed to create migrations table: {}", e))?;

    // Run each migration
    let migrations: Vec<(&str, &str)> = vec![
        ("001_initial_schema", include_str!("migrations/001_initial_schema.sql")),
    ];

    for (name, sql) in migrations {
        // Check if migration has already been applied
        let applied: bool = conn
            .query_row(
                "SELECT COUNT(*) > 0 FROM _migrations WHERE name = ?",
                [name],
                |row| row.get(0),
            )
            .map_err(|e| format!("Failed to check migration status: {}", e))?;

        if !applied {
            // Run the migration
            conn.execute_batch(sql)
                .map_err(|e| format!("Failed to run migration {}: {}", name, e))?;

            // Record the migration
            conn.execute("INSERT INTO _migrations (name) VALUES (?)", [name])
                .map_err(|e| format!("Failed to record migration {}: {}", name, e))?;

            println!("Applied migration: {}", name);
        }
    }

    Ok(())
}

