-- ================================================
-- OdontAll Database Initialization Script
-- ================================================
-- This script runs automatically when MySQL container starts
-- The database and user are already created by docker-entrypoint
-- This script only sets up initial tables if needed

-- Use the database
USE clinica_db;

-- Flush privileges to ensure all permissions are applied
FLUSH PRIVILEGES;

-- Display confirmation
SELECT 'Database clinica_db initialized successfully' AS status;
