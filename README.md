# KPI Tool

A standalone desktop application for tracking developer performance through ticket management, bug tracking, and monthly KPI reporting.

## Features

- **Developer Management** - Track your team members with roles (junior, mid, senior, lead)
- **Ticket Tracking** - Assign tickets with due dates, track on-time delivery and reopens
- **Bug Classification** - Categorize bugs fairly (developer error vs conceptual vs external)
- **KPI Reports** - Monthly performance reports with delivery and quality scores
- **Trend Analysis** - Track improvement or decline over time

## Tech Stack

| Component    | Technology         |
| ------------ | ------------------ |
| Framework    | Tauri              |
| Frontend     | React + TypeScript |
| Styling      | Tailwind + shadcn  |
| Database     | SQLite (embedded)  |
| Backend      | Rust               |

## Installation

### For Users
Download the `.dmg` file from [Releases](releases), open it, and drag the app to your Applications folder. That's it!

### For Developers
```bash
# Prerequisites
# - Node.js 18+
# - Rust (latest stable)
# - Xcode Command Line Tools (macOS)

# Clone the repository
git clone https://github.com/yourusername/kpi-tool.git
cd kpi-tool

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Documentation

- [Architecture](ARCHITECTURE.md) - Technical design and data models
- [Development Roadmap](DEVELOPMENT_ROADMAP.md) - Step-by-step build guide

## How KPI is Calculated

### Delivery Score (0-100)
Based on on-time ticket completion with bonuses for early delivery and penalties for late/reopened tickets.

### Quality Score (0-100)
Starts at 100, with deductions based on bugs:
- **Developer Error** bugs: Full deduction (by severity)
- **Conceptual** bugs: Minor deduction
- **Requirement Change / Environment / Third-Party** bugs: No deduction

### Overall Score
Weighted average of Delivery and Quality scores (configurable).

## Data Storage

Your data is stored locally at:
```
~/Library/Application Support/kpi-tool/
├── kpi.db          # SQLite database
├── config.json     # Preferences
└── backups/        # Auto-backups
```

## License

MIT
