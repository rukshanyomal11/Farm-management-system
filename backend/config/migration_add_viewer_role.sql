-- Migration: Add 'viewer' role to users table
-- Date: 2025-11-28
-- Description: Add viewer/consultant role to support read-only advisory access

USE farm_management;

-- Add 'viewer' to the role ENUM in users table
ALTER TABLE users 
MODIFY COLUMN role ENUM('super_admin', 'farm_owner', 'farm_manager', 'accountant', 'field_worker', 'viewer') DEFAULT 'farm_owner';

-- Verify the change
DESCRIBE users;

SELECT 'Migration completed: viewer role added successfully' AS status;
