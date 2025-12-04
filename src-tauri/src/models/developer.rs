use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum DeveloperRole {
    Junior,
    Mid,
    Senior,
    Lead,
}

impl DeveloperRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            DeveloperRole::Junior => "junior",
            DeveloperRole::Mid => "mid",
            DeveloperRole::Senior => "senior",
            DeveloperRole::Lead => "lead",
        }
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s.to_lowercase().as_str() {
            "junior" => Ok(DeveloperRole::Junior),
            "mid" => Ok(DeveloperRole::Mid),
            "senior" => Ok(DeveloperRole::Senior),
            "lead" => Ok(DeveloperRole::Lead),
            _ => Err(format!("Invalid developer role: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Developer {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: DeveloperRole,
    pub team: Option<String>,
    pub start_date: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateDeveloperInput {
    pub name: String,
    pub email: String,
    pub role: String,
    pub team: Option<String>,
    pub start_date: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDeveloperInput {
    pub id: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub role: Option<String>,
    pub team: Option<String>,
    pub is_active: Option<bool>,
}

