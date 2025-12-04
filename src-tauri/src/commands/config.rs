use crate::config::{load_kpi_config, save_kpi_config};
use crate::models::{BugPenalties, KPIConfig};

/// Get current KPI configuration
#[tauri::command]
pub fn get_kpi_config() -> Result<KPIConfig, String> {
    load_kpi_config()
}

/// Save KPI configuration
#[tauri::command]
pub fn save_kpi_config_command(
    delivery_weight: f64,
    quality_weight: f64,
    bug_penalty_critical: f64,
    bug_penalty_high: f64,
    bug_penalty_medium: f64,
    bug_penalty_low: f64,
) -> Result<(), String> {
    // Validate weights sum to 1.0
    let total_weight = delivery_weight + quality_weight;
    if (total_weight - 1.0).abs() > 0.01 {
        return Err(format!(
            "Weights must sum to 1.0 (current: {:.2})",
            total_weight
        ));
    }

    // Validate weights are between 0 and 1
    if delivery_weight < 0.0 || delivery_weight > 1.0 {
        return Err("Delivery weight must be between 0 and 1".to_string());
    }
    if quality_weight < 0.0 || quality_weight > 1.0 {
        return Err("Quality weight must be between 0 and 1".to_string());
    }

    // Validate bug penalties are non-negative
    if bug_penalty_critical < 0.0
        || bug_penalty_high < 0.0
        || bug_penalty_medium < 0.0
        || bug_penalty_low < 0.0
    {
        return Err("Bug penalties must be non-negative".to_string());
    }

    let config = KPIConfig {
        delivery_weight,
        quality_weight,
        bug_penalties: BugPenalties {
            critical: bug_penalty_critical,
            high: bug_penalty_high,
            medium: bug_penalty_medium,
            low: bug_penalty_low,
        },
    };

    save_kpi_config(&config)
}

