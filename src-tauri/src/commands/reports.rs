// Report/KPI commands - will be implemented in Phase 6
use crate::db::DbState;
use crate::models::MonthlyKPI;
use tauri::State;

#[tauri::command]
pub fn generate_monthly_kpi(
    _state: State<DbState>,
    _developer_id: String,
    _month: i32,
    _year: i32,
) -> Result<MonthlyKPI, String> {
    // TODO: Implement in Phase 6
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn get_kpi_history(
    _state: State<DbState>,
    _developer_id: String,
) -> Result<Vec<MonthlyKPI>, String> {
    // TODO: Implement in Phase 6
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub fn get_current_month_kpi(
    _state: State<DbState>,
    _developer_id: String,
) -> Result<MonthlyKPI, String> {
    // TODO: Implement in Phase 6
    Err("Not implemented yet".to_string())
}

