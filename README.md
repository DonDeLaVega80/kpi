# KPI Tool

A standalone desktop application for tracking developer performance through ticket management, bug tracking, and monthly KPI reporting.

## 🚧 Development Status

**Phase 3 Complete** - Developer Management UI is fully implemented.

### Completed
- ✅ Tauri + React + TypeScript project initialized
- ✅ Tailwind CSS + shadcn/ui configured
- ✅ SQLite database with migrations
- ✅ Rust backend structure (commands, models, services)
- ✅ Developer CRUD operations (create, read, update, soft-delete)
- ✅ Ticket CRUD operations (create, status updates, complete, reopen)
- ✅ Bug CRUD operations (create, resolve, auto-link to developer)
- ✅ React hooks for all entities (useDevelopers, useTickets, useBugs)
- ✅ App shell with sidebar navigation and routing
- ✅ Dark/light mode toggle with persistence
- ✅ Common UI components (DataTable, StatCard, StatusBadge, EmptyState, etc.)
- ✅ Form components with validation (react-hook-form + zod)
- ✅ Developer list page with search/filter
- ✅ Developer form dialog (create & edit modes)
- ✅ Developer detail card with summary stats and quick actions

### Next Up
- 🔲 Phase 4: Ticket Management (full CRUD UI)
- 🔲 Phase 5-11: See [Development Roadmap](DEVELOPMENT_ROADMAP.md)

## Features

- **Developer Management** - Track your team members with roles (junior, mid, senior, lead)
- **Ticket Tracking** - Assign tickets with due dates, track on-time delivery and reopens
- **Bug Classification** - Categorize bugs fairly (developer error vs conceptual vs external)
- **KPI Reports** - Monthly performance reports with delivery and quality scores
- **Trend Analysis** - Track improvement or decline over time

## Tech Stack

| Component    | Technology         |
| ------------ | ------------------ |
| Framework    | Tauri 2.x          |
| Frontend     | React 19 + TypeScript |
| Styling      | Tailwind CSS 4 + shadcn/ui |
| Database     | SQLite (rusqlite)  |
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

## Project Structure

```
kpi/
├── src/                      # React frontend
│   ├── components/
│   │   ├── ui/               # shadcn/ui + custom components
│   │   ├── layout/           # MainLayout, Sidebar, Header
│   │   └── developers/       # DeveloperFormDialog, DeveloperCard
│   ├── pages/                # Dashboard, Developers, Tickets, etc.
│   ├── hooks/                # useDevelopers, useTickets, useBugs
│   ├── types/                # TypeScript interfaces
│   └── lib/                  # Utilities & Tauri wrappers
├── src-tauri/src/            # Rust backend
│   ├── commands/             # Tauri IPC commands
│   ├── db/                   # Database & migrations
│   ├── models/               # Data structures
│   └── services/             # Business logic
├── ARCHITECTURE.md           # Technical design
└── DEVELOPMENT_ROADMAP.md    # Build guide
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
├── config.json     # Preferences (coming soon)
└── backups/        # Auto-backups (coming soon)
```

## License

MIT
