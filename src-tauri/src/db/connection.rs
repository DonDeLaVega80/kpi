use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::db::migrations::run_migrations;

/// Get the application data directory
pub fn get_app_data_dir() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join("Library")
        .join("Application Support")
        .join("kpi-tool")
}

/// Get the database file path
pub fn get_db_path() -> PathBuf {
    get_app_data_dir().join("kpi.db")
}

/// Initialize the database connection and run migrations
pub fn init_db() -> Result<Connection, String> {
    let app_dir = get_app_data_dir();

    // Create the app data directory if it doesn't exist
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app directory: {}", e))?;
    }

    let db_path = get_db_path();
    let conn =
        Connection::open(&db_path).map_err(|e| format!("Failed to open database: {}", e))?;

    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])
        .map_err(|e| format!("Failed to enable foreign keys: {}", e))?;

    // Run migrations
    run_migrations(&conn)?;

    Ok(conn)
}

/// Database state wrapper for thread-safe access
pub struct DbState(pub Mutex<Connection>);

impl DbState {
    pub fn new() -> Result<Self, String> {
        let conn = init_db()?;
        Ok(DbState(Mutex::new(conn)))
    }
}

// Add dirs crate for home directory
mod dirs {
    use std::path::PathBuf;

    pub fn home_dir() -> Option<PathBuf> {
        std::env::var_os("HOME").map(PathBuf::from)
    }
}

