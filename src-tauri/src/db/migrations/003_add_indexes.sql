-- Additional indexes for performance optimization
-- This migration adds indexes that were identified as beneficial for common queries

-- Index for filtering active developers (used frequently in queries)
CREATE INDEX IF NOT EXISTS idx_developers_active ON developers(is_active);

-- Index for filtering resolved bugs (used in bug queries)
CREATE INDEX IF NOT EXISTS idx_bugs_resolved ON bugs(is_resolved);

