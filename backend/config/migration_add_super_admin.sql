-- Migration to add super_admin role to users table
-- Run this SQL script to update your existing database

USE farm_management;

-- Add super_admin to the role ENUM
ALTER TABLE users 
MODIFY COLUMN role ENUM('super_admin', 'farm_owner', 'farm_manager', 'accountant', 'field_worker') DEFAULT 'farm_owner';

-- Verify the change
DESCRIBE users;
