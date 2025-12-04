use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum BugSeverity {
    Low,
    Medium,
    High,
    Critical,
}

impl BugSeverity {
    pub fn as_str(&self) -> &'static str {
        match self {
            BugSeverity::Low => "low",
            BugSeverity::Medium => "medium",
            BugSeverity::High => "high",
            BugSeverity::Critical => "critical",
        }
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s.to_lowercase().as_str() {
            "low" => Ok(BugSeverity::Low),
            "medium" => Ok(BugSeverity::Medium),
            "high" => Ok(BugSeverity::High),
            "critical" => Ok(BugSeverity::Critical),
            _ => Err(format!("Invalid bug severity: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum BugType {
    DeveloperError,
    Conceptual,
    RequirementChange,
    Environment,
    ThirdParty,
}

impl BugType {
    pub fn as_str(&self) -> &'static str {
        match self {
            BugType::DeveloperError => "developer_error",
            BugType::Conceptual => "conceptual",
            BugType::RequirementChange => "requirement_change",
            BugType::Environment => "environment",
            BugType::ThirdParty => "third_party",
        }
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s.to_lowercase().as_str() {
            "developer_error" => Ok(BugType::DeveloperError),
            "conceptual" => Ok(BugType::Conceptual),
            "requirement_change" => Ok(BugType::RequirementChange),
            "environment" => Ok(BugType::Environment),
            "third_party" => Ok(BugType::ThirdParty),
            _ => Err(format!("Invalid bug type: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Bug {
    pub id: String,
    pub ticket_id: String,
    pub developer_id: String,
    pub reported_by: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub severity: BugSeverity,
    pub bug_type: BugType,
    pub is_resolved: bool,
    pub resolved_date: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateBugInput {
    pub ticket_id: String,
    pub title: String,
    pub description: Option<String>,
    pub severity: String,
    pub bug_type: String,
    pub reported_by: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateBugInput {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub severity: Option<String>,
    pub bug_type: Option<String>,
    pub is_resolved: Option<bool>,
}

