# KPI Tool

A standalone desktop application for tracking developer performance through ticket management, bug tracking, and monthly KPI reporting.

## 🚧 Development Status

**Phase 5 Complete** - Full Bug Tracking with classification and resolution workflow.

### Completed
- ✅ Tauri + React + TypeScript project initialized
- ✅ Tailwind CSS + shadcn/ui configured
- ✅ SQLite database with migrations
- ✅ Rust backend structure (commands, models, services)
- ✅ Developer CRUD operations (create, read, update, soft-delete)
- ✅ Ticket CRUD operations (create, status updates, complete, reopen)
- ✅ Bug CRUD operations (create, resolve, reclassify, auto-link to developer)
- ✅ React hooks for all entities (useDevelopers, useTickets, useBugs)
- ✅ App shell with sidebar navigation and routing
- ✅ Dark/light mode toggle with persistence
- ✅ Common UI components (DataTable, StatCard, StatusBadge, EmptyState, etc.)
- ✅ Form components with validation (react-hook-form + zod)
- ✅ Developer list page with search/filter
- ✅ Developer form dialog (create & edit modes)
- ✅ Developer detail card with summary stats and quick actions
- ✅ Ticket list page with search, filter by status/developer, sorting
- ✅ Ticket form dialog (create & edit modes)
- ✅ Ticket detail card with status workflow buttons
- ✅ Mark Complete action (with accumulating actual hours)
- ✅ Reopen action (increments counter, affects KPI)
- ✅ Visual ticket timeline showing lifecycle stages
- ✅ Bug list page with comprehensive filtering
- ✅ Bug form dialog with visual bug type selector
- ✅ Bug detail card with classification display
- ✅ Bug resolve action with resolver selection and fix ticket linking
- ✅ Bug reclassify action with KPI impact visualization
- ✅ Auto-complete fix ticket when bug is resolved

### Next Up
- 🔲 Phase 6: KPI Calculation Engine
- 🔲 Phase 7-11: See [Development Roadmap](DEVELOPMENT_ROADMAP.md)

## Features

- **Developer Management** - Track your team members with roles (junior, mid, senior, lead)
- **Ticket Tracking** - Assign tickets with due dates, track on-time delivery and reopens
- **Bug Classification** - Categorize bugs fairly (developer error vs conceptual vs external)
- **Bug Resolution Workflow** - Track who fixed bugs and link to fix tickets
- **KPI Reports** - Monthly performance reports with delivery and quality scores (coming soon)
- **Trend Analysis** - Track improvement or decline over time (coming soon)

## Bug Tracking & KPI

### How Bugs Affect KPI

| Bug Type | KPI Impact | Description |
|----------|------------|-------------|
| **Developer Error** | Full deduction | Coding mistake or oversight |
| **Conceptual** | Minor deduction | Requirement misunderstanding |
| **Requirement Change** | No deduction | Spec changed after implementation |
| **Environment** | No deduction | Infrastructure issue |
| **Third-Party** | No deduction | External dependency problem |

### Bug Resolution Flow

When resolving a bug, you can:
1. **Select who fixed it** - Different from who introduced it
2. **Link a fix ticket** - The ticket created to fix this bug
3. **Log hours spent** - Time tracking for KPI

The system automatically:
- Keeps KPI impact on the developer who **introduced** the bug
- Reassigns the fix ticket to the **resolver**
- Marks the fix ticket as **completed**
- Adds logged hours to the fix ticket

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
│   │   ├── developers/       # DeveloperFormDialog, DeveloperCard
│   │   ├── tickets/          # TicketFormDialog, TicketCard, TicketTimeline
│   │   └── bugs/             # BugFormDialog, BugCard
│   ├── pages/                # Dashboard, Developers, Tickets, Bugs, Reports
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
