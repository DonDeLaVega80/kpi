// Bug commands - will be implemented in Phase 1
use crate::db::DbState;
use crate::models::{Bug, CreateBugInput, UpdateBugInput};
use tauri::State;

#[tauri::command]
pub fn create_bug(_state: State<DbState>, _input: CreateBugInput) -> Result<Bug, String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn get_bugs_by_ticket(
    _state: State<DbState>,
    _ticket_id: String,
) -> Result<Vec<Bug>, String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn get_bugs_by_developer(
    _state: State<DbState>,
    _developer_id: String,
) -> Result<Vec<Bug>, String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn update_bug(_state: State<DbState>, _input: UpdateBugInput) -> Result<Bug, String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn resolve_bug(_state: State<DbState>, _id: String) -> Result<Bug, String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

