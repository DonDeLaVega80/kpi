use crate::db::get_app_data_dir;
use crate::models::{BugPenalties, KPIConfig};
use serde_json;
use std::fs;
use std::path::PathBuf;

/// Get the config file path
pub fn get_config_path() -> PathBuf {
    get_app_data_dir().join("config.json")
}

/// Load KPI configuration from file, or return default if file doesn't exist
pub fn load_kpi_config() -> Result<KPIConfig, String> {
    let config_path = get_config_path();

    if !config_path.exists() {
        // Return default config if file doesn't exist
        return Ok(KPIConfig::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let config: KPIConfig = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config file: {}", e))?;

    Ok(config)
}

/// Save KPI configuration to file
pub fn save_kpi_config(config: &KPIConfig) -> Result<(), String> {
    let config_path = get_config_path();
    let app_dir = get_app_data_dir();

    // Ensure app directory exists
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| format!("Failed to create app directory: {}", e))?;
    }

    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok(())
}

