use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum KPITrend {
    Improving,
    Stable,
    Declining,
}

impl KPITrend {
    pub fn as_str(&self) -> &'static str {
        match self {
            KPITrend::Improving => "improving",
            KPITrend::Stable => "stable",
            KPITrend::Declining => "declining",
        }
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s.to_lowercase().as_str() {
            "improving" => Ok(KPITrend::Improving),
            "stable" => Ok(KPITrend::Stable),
            "declining" => Ok(KPITrend::Declining),
            _ => Err(format!("Invalid KPI trend: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MonthlyKPI {
    pub id: String,
    pub developer_id: String,
    pub month: i32,
    pub year: i32,

    // Ticket Metrics
    pub total_tickets: i32,
    pub completed_tickets: i32,
    pub on_time_tickets: i32,
    pub late_tickets: i32,
    pub reopened_tickets: i32,

    // Time Metrics
    pub on_time_rate: f64,
    pub avg_delivery_time: f64,

    // Bug Metrics
    pub total_bugs: i32,
    pub developer_error_bugs: i32,
    pub conceptual_bugs: i32,
    pub other_bugs: i32,

    // Calculated Scores
    pub delivery_score: f64,
    pub quality_score: f64,
    pub overall_score: f64,

    // Trend
    pub trend: Option<KPITrend>,

    pub generated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KPIConfig {
    pub delivery_weight: f64,
    pub quality_weight: f64,
    pub bug_penalties: BugPenalties,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BugPenalties {
    pub critical: f64,
    pub high: f64,
    pub medium: f64,
    pub low: f64,
}

impl Default for KPIConfig {
    fn default() -> Self {
        KPIConfig {
            delivery_weight: 0.5,
            quality_weight: 0.5,
            bug_penalties: BugPenalties {
                critical: 15.0,
                high: 10.0,
                medium: 5.0,
                low: 2.0,
            },
        }
    }
}

