-- Developers table
CREATE TABLE IF NOT EXISTS developers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('junior', 'mid', 'senior', 'lead')) NOT NULL,
    team TEXT,
    start_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    developer_id TEXT NOT NULL,
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completed_date DATE,
    status TEXT CHECK(status IN ('assigned', 'in_progress', 'review', 'completed', 'reopened')) NOT NULL DEFAULT 'assigned',
    estimated_hours REAL,
    actual_hours REAL,
    complexity TEXT CHECK(complexity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    reopen_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- Bugs table
CREATE TABLE IF NOT EXISTS bugs (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    developer_id TEXT NOT NULL,
    reported_by TEXT,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    bug_type TEXT CHECK(bug_type IN ('developer_error', 'conceptual', 'requirement_change', 'environment', 'third_party')) NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- Monthly KPI snapshots (cached calculations)
CREATE TABLE IF NOT EXISTS monthly_kpi (
    id TEXT PRIMARY KEY,
    developer_id TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_tickets INTEGER DEFAULT 0,
    completed_tickets INTEGER DEFAULT 0,
    on_time_tickets INTEGER DEFAULT 0,
    late_tickets INTEGER DEFAULT 0,
    reopened_tickets INTEGER DEFAULT 0,
    on_time_rate REAL DEFAULT 0,
    avg_delivery_time REAL DEFAULT 0,
    total_bugs INTEGER DEFAULT 0,
    developer_error_bugs INTEGER DEFAULT 0,
    conceptual_bugs INTEGER DEFAULT 0,
    other_bugs INTEGER DEFAULT 0,
    delivery_score REAL DEFAULT 0,
    quality_score REAL DEFAULT 0,
    overall_score REAL DEFAULT 0,
    trend TEXT CHECK(trend IN ('improving', 'stable', 'declining')),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(developer_id, month, year),
    FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_developer ON tickets(developer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_dates ON tickets(assigned_date, due_date, completed_date);
CREATE INDEX IF NOT EXISTS idx_bugs_ticket ON bugs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_bugs_developer ON bugs(developer_id);
CREATE INDEX IF NOT EXISTS idx_bugs_type ON bugs(bug_type);
CREATE INDEX IF NOT EXISTS idx_kpi_developer_period ON monthly_kpi(developer_id, year, month);

