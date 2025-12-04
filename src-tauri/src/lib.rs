mod commands;
mod db;
mod models;
mod services;

use commands::*;
use db::DbState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize database
    let db_state = DbState::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(db_state)
        .invoke_handler(tauri::generate_handler![
            // Developer commands
            create_developer,
            get_all_developers,
            get_developer_by_id,
            update_developer,
            delete_developer,
            // Ticket commands
            create_ticket,
            get_all_tickets,
            get_tickets_by_developer,
            update_ticket,
            update_ticket_status,
            complete_ticket,
            reopen_ticket,
            // Bug commands
            create_bug,
            get_bugs_by_ticket,
            get_bugs_by_developer,
            update_bug,
            resolve_bug,
            // KPI/Report commands
            generate_monthly_kpi,
            get_kpi_history,
            get_current_month_kpi,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
