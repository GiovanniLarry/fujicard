-- ============================================
-- ADD USER MANAGEMENT CAPABILITIES
-- ============================================

-- Adding an "is_banned" column allowing the admin to easily lock out toxic users.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
