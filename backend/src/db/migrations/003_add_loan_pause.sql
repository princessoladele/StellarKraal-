-- Migration 003: Add pause support to loans.
-- Adds a 'paused' status value and a dedicated pause_log table for audit purposes.

-- SQLite does not support ALTER COLUMN for CHECK constraints, so we rely on
-- application-level validation for the 'paused' status value.

-- Dedicated pause audit log table — immutable: no UPDATE/DELETE permitted by
-- application code. Provides a tamper-evident record of every pause/unpause event.
CREATE TABLE IF NOT EXISTS loan_pause_log (
  id          TEXT PRIMARY KEY,
  loan_id     TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('paused', 'unpaused')),
  admin_id    TEXT NOT NULL,
  reason      TEXT,
  timestamp   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_loan_pause_log_loan_id   ON loan_pause_log(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_pause_log_admin_id  ON loan_pause_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_loan_pause_log_timestamp ON loan_pause_log(timestamp);
