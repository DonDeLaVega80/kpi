# KPI Tool - Development Roadmap

A step-by-step guide to building the KPI Tool from scratch.

---

## Phase 0: Project Setup

**Estimated Time: 1-2 hours**

### 0.1 Initialize Tauri Project

- [x] Install prerequisites (Node.js 18+, Rust, Xcode CLI tools)
- [x] Create new Tauri project: `npm create tauri-app@latest kpi-tool`
- [x] Select React + TypeScript template
- [x] Verify setup with `npm run tauri dev`

### 0.2 Configure Frontend Tooling

- [x] Install Tailwind CSS
- [x] Install and configure shadcn/ui
- [x] Set up path aliases in `tsconfig.json`
- [x] Create base folder structure (`components/`, `pages/`, `hooks/`, `types/`, `lib/`)

### 0.3 Configure Rust Backend

- [x] Add SQLite dependencies to `Cargo.toml` (rusqlite or sqlx)
- [x] Add serde for JSON serialization
- [x] Add uuid for ID generation
- [x] Create base folder structure (`commands/`, `db/`, `models/`, `services/`)

### 0.4 Database Setup

- [x] Create database initialization function
- [x] Set up migrations system
- [x] Configure app data directory (`~/Library/Application Support/kpi-tool/`)
- [x] Write initial migration (create all tables)

**Deliverable:** Empty app launches, database file created on first run

---

## Phase 1: Core Data Layer

**Estimated Time: 3-4 hours**

### 1.1 Developer Model & CRUD

- [x] Create `Developer` struct in Rust
- [x] Implement `create_developer` command
- [x] Implement `get_all_developers` command
- [x] Implement `get_developer_by_id` command
- [x] Implement `update_developer` command
- [x] Implement `delete_developer` (soft delete - set `is_active = false`)
- [x] Create TypeScript types matching Rust structs
- [x] Create `useDevelopers` hook with Tauri invoke wrappers

### 1.2 Ticket Model & CRUD

- [x] Create `Ticket` struct in Rust
- [x] Implement `create_ticket` command
- [x] Implement `get_all_tickets` command
- [x] Implement `get_tickets_by_developer` command
- [x] Implement `update_ticket` command
- [x] Implement `update_ticket_status` command
- [x] Implement `reopen_ticket` command (increment reopen_count)
- [x] Implement `complete_ticket` command (auto-calculate wasOnTime)
- [x] Create TypeScript types
- [x] Create `useTickets` hook

### 1.3 Bug Model & CRUD

- [x] Create `Bug` struct in Rust
- [x] Implement `create_bug` command (auto-link to ticket's developer)
- [x] Implement `get_bugs_by_ticket` command
- [x] Implement `get_bugs_by_developer` command
- [x] Implement `update_bug` command
- [x] Implement `resolve_bug` command
- [x] Create TypeScript types
- [x] Create `useBugs` hook

**Deliverable:** All CRUD operations working via Tauri commands

---

## Phase 2: UI Foundation

**Estimated Time: 4-5 hours**

### 2.1 Layout Components

- [x] Create `MainLayout` component (sidebar + content area)
- [x] Create `Sidebar` component with navigation
- [x] Create `Header` component
- [x] Set up React Router for page navigation
- [x] Implement dark/light mode toggle

### 2.2 Common UI Components

- [x] Set up shadcn/ui base components (Button, Input, Select, Dialog, etc.)
- [x] Create `DataTable` component for lists
- [x] Create `StatCard` component for metrics display
- [x] Create `StatusBadge` component (for ticket/bug status)
- [x] Create `EmptyState` component
- [x] Create `LoadingSpinner` component
- [x] Create `ConfirmDialog` component

### 2.3 Form Components

- [x] Create reusable `FormField` wrapper
- [x] Create `DatePicker` component
- [x] Create `SelectField` component (for dropdowns)
- [x] Set up form validation (react-hook-form + zod)

**Deliverable:** App shell with navigation, consistent styling

---

## Phase 3: Developer Management

**Estimated Time: 3-4 hours**

### 3.1 Developer List Page

- [x] Create `Developers` page
- [x] Display developers in a table/grid
- [x] Show key info: name, email, role, team, status
- [x] Add search/filter functionality
- [x] Add "Add Developer" button

### 3.2 Developer Form

- [ ] Create `DeveloperForm` component
- [ ] Fields: name, email, role (dropdown), team, start date
- [ ] Validation: required fields, email format
- [ ] Handle create mode
- [ ] Handle edit mode

### 3.3 Developer Detail/Card

- [ ] Create `DeveloperCard` component
- [ ] Show developer summary stats
- [ ] Quick actions: edit, deactivate
- [ ] Link to full developer report

**Deliverable:** Full developer CRUD in UI

---

## Phase 4: Ticket Management

**Estimated Time: 5-6 hours**

### 4.1 Ticket List Page

- [ ] Create `Tickets` page
- [ ] Display tickets in table view
- [ ] Show: title, developer, due date, status, complexity
- [ ] Color-code overdue tickets
- [ ] Filter by: status, developer, date range
- [ ] Sort by: due date, assigned date, status

### 4.2 Ticket Form

- [ ] Create `TicketForm` component
- [ ] Fields: title, description, developer (dropdown), due date, complexity, estimated hours
- [ ] Auto-set assigned date to today
- [ ] Validation: required fields, due date >= today

### 4.3 Ticket Card & Actions

- [ ] Create `TicketCard` component for detail view
- [ ] Show full ticket info + history
- [ ] Status change buttons (workflow)
- [ ] "Mark Complete" action (calculates on-time)
- [ ] "Reopen" action (increments counter)
- [ ] Show linked bugs

### 4.4 Ticket Timeline (Optional)

- [ ] Create `TicketTimeline` component
- [ ] Visual timeline of ticket lifecycle
- [ ] Show status changes with timestamps

**Deliverable:** Full ticket management workflow

---

## Phase 5: Bug Tracking

**Estimated Time: 3-4 hours**

### 5.1 Bug List

- [ ] Create `Bugs` page (or section within Tickets)
- [ ] Display bugs in table
- [ ] Show: title, ticket, developer, severity, type, status
- [ ] Filter by: bug type, severity, resolved status

### 5.2 Bug Form

- [ ] Create `BugForm` component
- [ ] Fields: title, description, ticket (dropdown), severity, bug type
- [ ] Auto-fill developer from selected ticket
- [ ] **Bug Type Selection** - make this prominent with descriptions:
  - Developer Error
  - Conceptual/Requirement Misunderstanding
  - Requirement Change
  - Environment Issue
  - Third-Party Issue

### 5.3 Bug Classification UI

- [ ] Create `BugClassification` component
- [ ] Visual guide for choosing bug type
- [ ] Help text explaining each type
- [ ] Impact on KPI shown

**Deliverable:** Complete bug tracking with classification

---

## Phase 6: KPI Calculation Engine

**Estimated Time: 4-5 hours**

### 6.1 KPI Calculator Service (Rust)

- [ ] Create `kpi_calculator.rs` service
- [ ] Implement `calculate_delivery_score`:
  - Base: (on_time / completed) \* 100
  - Bonus for early deliveries
  - Penalty for late critical tickets
  - Penalty for reopened tickets
- [ ] Implement `calculate_quality_score`:
  - Start at 100
  - Deduct based on developer_error bugs (by severity)
  - Minor deduction for conceptual bugs
  - No deduction for other types
- [ ] Implement `calculate_overall_score`:
  - Weighted average (configurable)
- [ ] Implement `calculate_trend`:
  - Compare with 3-month average

### 6.2 Monthly KPI Generation

- [ ] Implement `generate_monthly_kpi` command
- [ ] Aggregate all metrics for a developer/month
- [ ] Store in `monthly_kpi` table
- [ ] Implement `get_kpi_history` command

### 6.3 Real-time KPI Preview

- [ ] Implement `get_current_month_kpi` command
- [ ] Calculate on-the-fly (not stored)
- [ ] Used for dashboard display

**Deliverable:** Working KPI calculation engine

---

## Phase 7: Reports & Visualization

**Estimated Time: 5-6 hours**

### 7.1 Install Chart Library

- [ ] Install recharts or chart.js
- [ ] Create chart wrapper components

### 7.2 Monthly Report Page

- [ ] Create `Reports` page
- [ ] Month/Year selector
- [ ] Developer selector (or "All")
- [ ] Generate report button

### 7.3 Report Components

- [ ] Create `MonthlyReport` component
- [ ] Summary cards: delivery score, quality score, overall
- [ ] Ticket breakdown (completed, on-time, late, reopened)
- [ ] Bug breakdown by type (pie chart)
- [ ] Create `TrendChart` component (line chart over months)

### 7.4 Developer KPI View

- [ ] Create `DeveloperKPI` component
- [ ] Individual developer deep-dive
- [ ] Historical performance graph
- [ ] Comparison with team average

### 7.5 Export Functionality

- [ ] Create `ExportButton` component
- [ ] Export to CSV (implement in Rust)
- [ ] Export to PDF (use browser print or pdf library)

**Deliverable:** Visual reports with charts and export

---

## Phase 8: Dashboard

**Estimated Time: 3-4 hours**

### 8.1 Dashboard Layout

- [ ] Create `Dashboard` page
- [ ] Design grid layout for widgets

### 8.2 Dashboard Widgets

- [ ] Active developers count
- [ ] Current month on-time rate
- [ ] Current month quality score
- [ ] Overdue tickets alert (with count)
- [ ] Recent activity feed
- [ ] Monthly trend mini-chart

### 8.3 Quick Actions

- [ ] "Add Ticket" quick button
- [ ] "Report Bug" quick button
- [ ] Links to detailed views

**Deliverable:** Informative dashboard homepage

---

## Phase 9: Settings & Configuration

**Estimated Time: 2-3 hours**

### 9.1 Settings Page

- [ ] Create `Settings` page
- [ ] Organize into sections

### 9.2 KPI Configuration

- [ ] Delivery score weight slider
- [ ] Quality score weight slider
- [ ] Bug severity penalties (editable)
- [ ] Save to config file

### 9.3 Data Management

- [ ] Manual backup button
- [ ] Restore from backup
- [ ] Export all data (JSON)
- [ ] Import data (JSON)
- [ ] Clear all data (with confirmation)

### 9.4 App Preferences

- [ ] Theme toggle (dark/light/system)
- [ ] Working days configuration
- [ ] Date format preference

**Deliverable:** Configurable app settings

---

## Phase 10: Polish & Testing

**Estimated Time: 3-4 hours**

### 10.1 Error Handling

- [ ] Add error boundaries in React
- [ ] Toast notifications for success/error
- [ ] Graceful handling of database errors
- [ ] Validation error messages

### 10.2 Loading States

- [ ] Add loading indicators to all data fetches
- [ ] Skeleton loaders for lists
- [ ] Disable buttons during operations

### 10.3 Edge Cases

- [ ] Handle empty states (no developers, no tickets)
- [ ] Handle first-time setup
- [ ] Handle corrupted database (offer restore)

### 10.4 Performance

- [ ] Add pagination to large lists
- [ ] Optimize database queries
- [ ] Lazy load pages

**Deliverable:** Polished, error-free application

---

## Phase 11: Build & Distribution

**Estimated Time: 2-3 hours**

### 11.1 App Metadata

- [ ] Set app name, version in `tauri.conf.json`
- [ ] Create app icon (multiple sizes)
- [ ] Set bundle identifier

### 11.2 macOS Build

- [ ] Run `npm run tauri build`
- [ ] Test `.dmg` installer
- [ ] Test app in Applications folder
- [ ] Verify database location

### 11.3 Code Signing (Optional)

- [ ] Obtain Apple Developer ID
- [ ] Sign the application
- [ ] Notarize with Apple

### 11.4 Release

- [ ] Create GitHub release
- [ ] Upload `.dmg` artifact
- [ ] Write release notes

**Deliverable:** Distributable macOS application

---

## Summary Timeline

| Phase     | Description             | Est. Time        |
| --------- | ----------------------- | ---------------- |
| 0         | Project Setup           | 1-2 hours        |
| 1         | Core Data Layer         | 3-4 hours        |
| 2         | UI Foundation           | 4-5 hours        |
| 3         | Developer Management    | 3-4 hours        |
| 4         | Ticket Management       | 5-6 hours        |
| 5         | Bug Tracking            | 3-4 hours        |
| 6         | KPI Calculation         | 4-5 hours        |
| 7         | Reports & Visualization | 5-6 hours        |
| 8         | Dashboard               | 3-4 hours        |
| 9         | Settings                | 2-3 hours        |
| 10        | Polish & Testing        | 3-4 hours        |
| 11        | Build & Distribution    | 2-3 hours        |
| **Total** |                         | **~40-50 hours** |

---

## Recommended Development Order

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
                                                    ↓
                              Phase 8 ← Phase 7 ← Phase 6
                                ↓
                            Phase 9 → Phase 10 → Phase 11
```

### MVP (Minimum Viable Product)

To get a working app quickly, prioritize:

1. Phase 0 (Setup)
2. Phase 1 (Data Layer)
3. Phase 2 (UI Foundation)
4. Phase 3 (Developers)
5. Phase 4 (Tickets)
6. Phase 6 (KPI Calculation - basic)
7. Phase 11 (Build)

This gives you a functional app in ~20-25 hours.

---

## Notes

- Each checkbox can be treated as a commit point
- Test after each phase before moving on
- Keep the UI simple initially, enhance later
- Database migrations should be backward compatible
- Back up your database before testing destructive operations
