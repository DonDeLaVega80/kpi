-- Add columns to track who resolved the bug and the fix ticket
-- The bug's KPI impact is on developer_id (who introduced it)
-- resolved_by_developer_id tracks who fixed it (can be different)
-- fix_ticket_id tracks the ticket created to fix this bug (optional)

ALTER TABLE bugs ADD COLUMN resolved_by_developer_id TEXT REFERENCES developers(id);
ALTER TABLE bugs ADD COLUMN fix_ticket_id TEXT REFERENCES tickets(id);

-- Index for querying bugs resolved by a developer
CREATE INDEX IF NOT EXISTS idx_bugs_resolved_by ON bugs(resolved_by_developer_id);

