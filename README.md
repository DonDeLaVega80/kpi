# KPI Tool

A standalone desktop application for tracking developer performance through ticket management, bug tracking, and monthly KPI reporting.

## 🚧 Development Status

**Phase 9 Complete** - Settings & Configuration with KPI customization and data management fully implemented.

### Completed

- ✅ Tauri + React + TypeScript project initialized
- ✅ Tailwind CSS + shadcn/ui configured
- ✅ SQLite database with migrations
- ✅ Rust backend structure (commands, models, services)
- ✅ Developer CRUD operations (create, read, update, soft-delete)
- ✅ Ticket CRUD operations (create, status updates, complete, reopen)
- ✅ Bug CRUD operations (create, resolve, reclassify, auto-link to developer)
- ✅ React hooks for all entities (useDevelopers, useTickets, useBugs, useKPI)
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
- ✅ KPI Calculator Service (delivery, quality, overall scores)
- ✅ Monthly KPI generation and storage
- ✅ Real-time KPI preview (current month)
- ✅ Dashboard with team KPI summary and averages
- ✅ Reports page with month/year/developer selectors
- ✅ Monthly report component with charts (ticket breakdown, bug breakdown, trend)
- ✅ Developer KPI deep-dive view with historical performance
- ✅ Export functionality (CSV and PDF/HTML export)
- ✅ Chart library integration (recharts) with custom chart components
- ✅ Enhanced Dashboard with widget-based grid layout
- ✅ Dashboard widgets (active developers, on-time rate, quality score, overdue alerts)
- ✅ Monthly trend mini-chart showing team performance over time
- ✅ Quick action buttons (Add Ticket, Report Bug) with inline dialogs
- ✅ Recent activity feed with developer names and dates
- ✅ Settings page with organized sections
- ✅ KPI Configuration (delivery/quality weights, bug severity penalties)
- ✅ Data Management (backup, restore, export, import, clear)
- ✅ Theme toggle (dark/light/system) with persistence

### Next Up

- 🔲 Phase 10: Polish & Testing
- 🔲 Phase 11: See [Development Roadmap](DEVELOPMENT_ROADMAP.md)

## Features

- **Developer Management** - Track your team members with roles (junior, mid, senior, lead)
- **Ticket Tracking** - Assign tickets with due dates, track on-time delivery and reopens
- **Bug Classification** - Categorize bugs fairly (developer error vs conceptual vs external)
- **Bug Resolution Workflow** - Track who fixed bugs and link to fix tickets
- **KPI Calculation** - Automatic calculation of delivery, quality, and overall scores
- **Real-time Dashboard** - View team performance metrics and averages
- **Monthly KPI Reports** - Generate and store monthly performance snapshots with detailed charts
- **Trend Analysis** - Track improvement or decline over time with visual trend charts
- **Export Reports** - Export KPI reports as CSV or HTML (for PDF printing)
- **Developer KPI Deep-Dive** - Individual developer performance analysis with historical trends

## Bug Tracking & KPI

### How Bugs Affect KPI

| Bug Type               | KPI Impact      | Description                       |
| ---------------------- | --------------- | --------------------------------- |
| **Developer Error**    | Full deduction  | Coding mistake or oversight       |
| **Conceptual**         | Minor deduction | Requirement misunderstanding      |
| **Requirement Change** | No deduction    | Spec changed after implementation |
| **Environment**        | No deduction    | Infrastructure issue              |
| **Third-Party**        | No deduction    | External dependency problem       |

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

| Component | Technology                 |
| --------- | -------------------------- |
| Framework | Tauri 2.x                  |
| Frontend  | React 19 + TypeScript      |
| Styling   | Tailwind CSS 4 + shadcn/ui |
| Database  | SQLite (rusqlite)          |
| Backend   | Rust                       |

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
│   │   ├── bugs/             # BugFormDialog, BugCard
│   │   └── reports/          # MonthlyReport, DeveloperKPI, ExportButton
│   ├── pages/                # Dashboard, Developers, Tickets, Bugs, Reports
│   ├── hooks/                # useDevelopers, useTickets, useBugs, useKPI
│   ├── types/                # TypeScript interfaces
│   └── lib/                  # Utilities & Tauri wrappers
├── src-tauri/src/            # Rust backend
│   ├── commands/             # Tauri IPC commands
│   ├── db/                   # Database & migrations
│   ├── models/               # Data structures
│   └── services/             # Business logic (KPI calculator)
├── ARCHITECTURE.md           # Technical design
└── DEVELOPMENT_ROADMAP.md    # Build guide
```

## Documentation

- [Architecture](ARCHITECTURE.md) - Technical design and data models
- [Development Roadmap](DEVELOPMENT_ROADMAP.md) - Step-by-step build guide

## How KPI is Calculated

### Delivery Score (0-100)

Based on on-time ticket completion:

- **Base**: (on-time tickets / completed tickets) × 100
- **Bonus**: +5 points per early delivery (>1 day early)
- **Penalty**: -10 points per late critical ticket
- **Penalty**: -5 points per reopened ticket

### Quality Score (0-100)

Starts at 100, with deductions based on bugs:

- **Developer Error** bugs: -15 (critical), -10 (high), -5 (medium), -2 (low) per bug
- **Conceptual** bugs: -3 per bug
- **Requirement Change / Environment / Third-Party** bugs: No deduction

### Overall Score

Weighted average of Delivery and Quality scores (configurable in Settings, default: 50/50 split).

### Trend Calculation

Compares current month's overall score with previous 3 months average:

- **Improving**: current > average + 5
- **Stable**: within ±5 of average
- **Declining**: current < average - 5

## Dashboard

The Dashboard provides real-time insights with a comprehensive widget-based layout:

### Primary Metrics

- **Active Developers**: Current count of active team members
- **Open Tickets**: Tickets currently in progress
- **Completed Tickets**: Total completed tickets
- **Average Score**: Team-wide overall KPI average

### Current Month Metrics

- **On-Time Rate**: Average on-time completion rate for the current month
- **Quality Score**: Average quality score for the current month
- **Overdue Tickets Alert**: Visual warning when tickets are past due date

### Performance Tracking

- **Monthly Trend Chart**: Team average overall score over the last 6 months
- **Team KPI Summary**: Individual developer scores with delivery, quality, and overall metrics
- **Recent Activity Feed**: Latest completed tickets and reported bugs with developer names

### Quick Actions

- **Add Ticket**: Create new tickets directly from the dashboard
- **Report Bug**: Report bugs without leaving the dashboard
- **Navigation Links**: Quick access to Developers, Tickets, Bugs, and Reports pages

## Reports & Export

### Monthly Reports

Generate detailed KPI reports for any developer or the entire team:

- **Summary Cards**: Delivery, Quality, and Overall scores
- **Ticket Breakdown**: Bar chart showing completed, on-time, late, and reopened tickets
- **Bug Breakdown**: Pie chart showing bug types (Developer Error, Conceptual, Other)
- **Performance Trend**: Line chart showing score progression over the last 6 months
- **Detailed Metrics**: Comprehensive breakdown of all ticket and bug metrics

### Developer KPI Deep-Dive

View individual developer performance:

- **Average Scores**: Historical averages across all months
- **Latest Month**: Current month performance snapshot
- **Trend Chart**: Visual representation of performance over time
- **Monthly Breakdown Table**: Detailed metrics for each month

### Export Options

- **CSV Export**: Download KPI data as a CSV file for analysis in Excel or other tools
- **PDF Export**: Save reports as HTML files that can be opened in a browser and printed to PDF
- **Native File Dialogs**: Uses system file dialogs for seamless file saving

## Settings & Configuration

### KPI Configuration

Customize how KPI scores are calculated:

- **Score Weights**: Adjust the balance between delivery and quality scores (must sum to 100%)
- **Bug Severity Penalties**: Configure point deductions for each bug severity level
  - Critical: Default 15 points
  - High: Default 10 points
  - Medium: Default 5 points
  - Low: Default 2 points
- **Auto-Save**: Configuration is automatically saved to `config.json`

### Data Management

Comprehensive data management tools:

- **Export All Data (JSON)**: Export all developers, tickets, bugs, and KPI reports to a JSON file
- **Import Data (JSON)**: Import data from a JSON file (automatically reloads the app)
- **Backup Database**: Create timestamped backups of the SQLite database
- **Restore Database**: Restore from a backup file (automatically reloads the app)
- **Clear All Data**: Permanently delete all data with confirmation dialog

### App Preferences

- **Theme Toggle**: Switch between dark, light, or system theme
- **Theme Persistence**: Your theme preference is saved and restored on app launch

## Data Storage

Your data is stored locally at:

```
~/Library/Application Support/kpi-tool/
├── kpi.db          # SQLite database
├── config.json     # KPI configuration (weights, bug penalties)
└── backups/        # Manual database backups (timestamped)
```

## License

MIT
