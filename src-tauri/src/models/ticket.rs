use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum TicketStatus {
    Assigned,
    InProgress,
    Review,
    Completed,
    Reopened,
}

impl TicketStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            TicketStatus::Assigned => "assigned",
            TicketStatus::InProgress => "in_progress",
            TicketStatus::Review => "review",
            TicketStatus::Completed => "completed",
            TicketStatus::Reopened => "reopened",
        }
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s.to_lowercase().as_str() {
            "assigned" => Ok(TicketStatus::Assigned),
            "in_progress" => Ok(TicketStatus::InProgress),
            "review" => Ok(TicketStatus::Review),
            "completed" => Ok(TicketStatus::Completed),
            "reopened" => Ok(TicketStatus::Reopened),
            _ => Err(format!("Invalid ticket status: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TicketComplexity {
    Low,
    Medium,
    High,
    Critical,
}

impl TicketComplexity {
    pub fn as_str(&self) -> &'static str {
        match self {
            TicketComplexity::Low => "low",
            TicketComplexity::Medium => "medium",
            TicketComplexity::High => "high",
            TicketComplexity::Critical => "critical",
        }
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s.to_lowercase().as_str() {
            "low" => Ok(TicketComplexity::Low),
            "medium" => Ok(TicketComplexity::Medium),
            "high" => Ok(TicketComplexity::High),
            "critical" => Ok(TicketComplexity::Critical),
            _ => Err(format!("Invalid ticket complexity: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Ticket {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub developer_id: String,
    pub assigned_date: String,
    pub due_date: String,
    pub completed_date: Option<String>,
    pub status: TicketStatus,
    pub estimated_hours: Option<f64>,
    pub actual_hours: Option<f64>,
    pub complexity: TicketComplexity,
    pub reopen_count: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTicketInput {
    pub title: String,
    pub description: Option<String>,
    pub developer_id: String,
    pub due_date: String,
    pub complexity: String,
    pub estimated_hours: Option<f64>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTicketInput {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub developer_id: Option<String>,
    pub due_date: Option<String>,
    pub status: Option<String>,
    pub actual_hours: Option<f64>,
}

