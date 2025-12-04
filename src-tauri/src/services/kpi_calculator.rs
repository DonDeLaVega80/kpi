// KPI Calculator Service
// Implements the core KPI calculation logic as defined in ARCHITECTURE.md

use crate::models::{KPIConfig, KPITrend};

/// Bug counts by severity for quality score calculation
#[derive(Debug, Default)]
pub struct BugCounts {
    pub critical: i32,
    pub high: i32,
    pub medium: i32,
    pub low: i32,
}

/// Delivery metrics for delivery score calculation
#[derive(Debug)]
pub struct DeliveryMetrics {
    pub completed_tickets: i32,
    pub on_time_tickets: i32,
    pub early_deliveries: i32,      // Completed > 1 day before due date
    pub late_critical_tickets: i32, // Critical tickets completed late
    pub reopened_tickets: i32,      // Tickets that were reopened
}

/// Calculate delivery score based on on-time completion
/// 
/// Formula:
/// - Base: (on_time_tickets / completed_tickets) * 100
/// - Bonus: +5 for each early delivery (> 1 day early)
/// - Penalty: -10 for each critical ticket late
/// - Penalty: -5 for each reopened ticket
/// 
/// Score is clamped to 0-100 range
pub fn calculate_delivery_score(metrics: &DeliveryMetrics) -> f64 {
    // Handle edge case: no completed tickets
    if metrics.completed_tickets == 0 {
        return 100.0; // Perfect score if no tickets to complete
    }

    // Base score: percentage of on-time completions
    let base_score = (metrics.on_time_tickets as f64 / metrics.completed_tickets as f64) * 100.0;

    // Bonuses
    let early_bonus = metrics.early_deliveries as f64 * 5.0;

    // Penalties
    let late_critical_penalty = metrics.late_critical_tickets as f64 * 10.0;
    let reopen_penalty = metrics.reopened_tickets as f64 * 5.0;

    // Calculate final score
    let score = base_score + early_bonus - late_critical_penalty - reopen_penalty;

    // Clamp to 0-100 range
    score.clamp(0.0, 100.0)
}

/// Calculate quality score based on bug rate
/// 
/// Formula:
/// - Base: 100
/// - Deductions for developer_error bugs (by severity):
///   - Critical: -15 per bug
///   - High: -10 per bug
///   - Medium: -5 per bug
///   - Low: -2 per bug
/// - Deductions for conceptual bugs: -3 per bug
/// - Other bug types: No deduction
/// 
/// Score is clamped to 0-100 range
pub fn calculate_quality_score(
    developer_error_bugs: &BugCounts,
    conceptual_bugs: i32,
    config: &KPIConfig,
) -> f64 {
    let base_score = 100.0;

    // Calculate developer error deductions
    let dev_error_deduction = 
        (developer_error_bugs.critical as f64 * config.bug_penalties.critical) +
        (developer_error_bugs.high as f64 * config.bug_penalties.high) +
        (developer_error_bugs.medium as f64 * config.bug_penalties.medium) +
        (developer_error_bugs.low as f64 * config.bug_penalties.low);

    // Conceptual bugs have a fixed minor deduction
    let conceptual_deduction = conceptual_bugs as f64 * 3.0;

    // Calculate final score
    let score = base_score - dev_error_deduction - conceptual_deduction;

    // Clamp to 0-100 range
    score.clamp(0.0, 100.0)
}

/// Calculate overall score as weighted average of delivery and quality scores
/// 
/// Formula:
/// overallScore = (deliveryScore * deliveryWeight) + (qualityScore * qualityWeight)
/// 
/// Default weights are 0.5 each (50/50 split)
pub fn calculate_overall_score(
    delivery_score: f64,
    quality_score: f64,
    config: &KPIConfig,
) -> f64 {
    let score = (delivery_score * config.delivery_weight) + (quality_score * config.quality_weight);
    
    // Clamp to 0-100 range (should already be in range, but just in case)
    score.clamp(0.0, 100.0)
}

/// Calculate trend by comparing current score with previous months average
/// 
/// Logic:
/// - Improving: current > avg + 5
/// - Declining: current < avg - 5
/// - Stable: within ±5 of average
/// 
/// If no previous scores available, returns Stable
pub fn calculate_trend(
    current_score: f64,
    previous_scores: &[f64],
) -> KPITrend {
    // If no previous data, consider stable
    if previous_scores.is_empty() {
        return KPITrend::Stable;
    }

    // Calculate average of previous scores
    let sum: f64 = previous_scores.iter().sum();
    let avg = sum / previous_scores.len() as f64;

    // Determine trend based on threshold of 5 points
    const THRESHOLD: f64 = 5.0;

    if current_score > avg + THRESHOLD {
        KPITrend::Improving
    } else if current_score < avg - THRESHOLD {
        KPITrend::Declining
    } else {
        KPITrend::Stable
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_delivery_score_perfect() {
        let metrics = DeliveryMetrics {
            completed_tickets: 10,
            on_time_tickets: 10,
            early_deliveries: 0,
            late_critical_tickets: 0,
            reopened_tickets: 0,
        };
        assert_eq!(calculate_delivery_score(&metrics), 100.0);
    }

    #[test]
    fn test_delivery_score_with_bonuses() {
        let metrics = DeliveryMetrics {
            completed_tickets: 10,
            on_time_tickets: 10,
            early_deliveries: 2, // +10 bonus
            late_critical_tickets: 0,
            reopened_tickets: 0,
        };
        // 100 + 10 = 110, clamped to 100
        assert_eq!(calculate_delivery_score(&metrics), 100.0);
    }

    #[test]
    fn test_delivery_score_with_penalties() {
        let metrics = DeliveryMetrics {
            completed_tickets: 10,
            on_time_tickets: 8, // 80% base
            early_deliveries: 0,
            late_critical_tickets: 1, // -10
            reopened_tickets: 2, // -10
        };
        // 80 - 10 - 10 = 60
        assert_eq!(calculate_delivery_score(&metrics), 60.0);
    }

    #[test]
    fn test_delivery_score_no_tickets() {
        let metrics = DeliveryMetrics {
            completed_tickets: 0,
            on_time_tickets: 0,
            early_deliveries: 0,
            late_critical_tickets: 0,
            reopened_tickets: 0,
        };
        assert_eq!(calculate_delivery_score(&metrics), 100.0);
    }

    #[test]
    fn test_quality_score_perfect() {
        let bugs = BugCounts::default();
        let config = KPIConfig::default();
        assert_eq!(calculate_quality_score(&bugs, 0, &config), 100.0);
    }

    #[test]
    fn test_quality_score_with_bugs() {
        let bugs = BugCounts {
            critical: 1, // -15
            high: 1,     // -10
            medium: 2,   // -10
            low: 0,
        };
        let config = KPIConfig::default();
        // 100 - 15 - 10 - 10 = 65
        assert_eq!(calculate_quality_score(&bugs, 0, &config), 65.0);
    }

    #[test]
    fn test_quality_score_with_conceptual() {
        let bugs = BugCounts::default();
        let config = KPIConfig::default();
        // 100 - (3 * 3) = 91
        assert_eq!(calculate_quality_score(&bugs, 3, &config), 91.0);
    }

    #[test]
    fn test_quality_score_floor() {
        let bugs = BugCounts {
            critical: 10, // -150
            high: 0,
            medium: 0,
            low: 0,
        };
        let config = KPIConfig::default();
        // 100 - 150 = -50, clamped to 0
        assert_eq!(calculate_quality_score(&bugs, 0, &config), 0.0);
    }

    #[test]
    fn test_overall_score() {
        let config = KPIConfig::default(); // 50/50 weights
        assert_eq!(calculate_overall_score(80.0, 90.0, &config), 85.0);
    }

    #[test]
    fn test_trend_improving() {
        let previous = vec![70.0, 72.0, 68.0]; // avg = 70
        assert_eq!(calculate_trend(80.0, &previous), KPITrend::Improving);
    }

    #[test]
    fn test_trend_declining() {
        let previous = vec![80.0, 82.0, 78.0]; // avg = 80
        assert_eq!(calculate_trend(70.0, &previous), KPITrend::Declining);
    }

    #[test]
    fn test_trend_stable() {
        let previous = vec![75.0, 77.0, 73.0]; // avg = 75
        assert_eq!(calculate_trend(77.0, &previous), KPITrend::Stable);
    }

    #[test]
    fn test_trend_no_history() {
        let previous: Vec<f64> = vec![];
        assert_eq!(calculate_trend(80.0, &previous), KPITrend::Stable);
    }
}
