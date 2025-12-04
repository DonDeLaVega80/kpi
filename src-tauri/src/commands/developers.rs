// Developer commands - will be implemented in Phase 1
use crate::db::DbState;
use crate::models::{CreateDeveloperInput, Developer, UpdateDeveloperInput};
use tauri::State;

#[tauri::command]
pub fn create_developer(
    _state: State<DbState>,
    _input: CreateDeveloperInput,
) -> Result<Developer, String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn get_all_developers(_state: State<DbState>) -> Result<Vec<Developer>, String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn get_developer_by_id(_state: State<DbState>, _id: String) -> Result<Developer, String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn update_developer(
    _state: State<DbState>,
    _input: UpdateDeveloperInput,
) -> Result<Developer, String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn delete_developer(_state: State<DbState>, _id: String) -> Result<(), String> {
    // TODO: Implement in Phase 1
    Err("Not implemented yet".to_string())
}

