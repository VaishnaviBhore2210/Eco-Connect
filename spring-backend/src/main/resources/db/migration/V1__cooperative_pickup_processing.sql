-- Safe, additive MySQL migration. Run against ecoconnect_db before deploying.
-- Each column is nullable so existing listings remain valid and untouched.
SET @schema_name = DATABASE();

SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'waste_listings'
      AND COLUMN_NAME = 'assigned_coordinator_email'
);
SET @migration_sql = IF(@column_exists = 0,
    'ALTER TABLE waste_listings ADD COLUMN assigned_coordinator_email VARCHAR(255) NULL',
    'SELECT 1');
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'waste_listings'
      AND COLUMN_NAME = 'scheduled_pickup_at'
);
SET @migration_sql = IF(@column_exists = 0,
    'ALTER TABLE waste_listings ADD COLUMN scheduled_pickup_at DATETIME(6) NULL',
    'SELECT 1');
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'waste_listings'
      AND COLUMN_NAME = 'collected_at'
);
SET @migration_sql = IF(@column_exists = 0,
    'ALTER TABLE waste_listings ADD COLUMN collected_at DATETIME(6) NULL',
    'SELECT 1');
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'waste_listings'
      AND COLUMN_NAME = 'processing_status'
);
SET @migration_sql = IF(@column_exists = 0,
    'ALTER TABLE waste_listings ADD COLUMN processing_status VARCHAR(255) NULL',
    'SELECT 1');
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'waste_listings'
      AND COLUMN_NAME = 'processing_updated_at'
);
SET @migration_sql = IF(@column_exists = 0,
    'ALTER TABLE waste_listings ADD COLUMN processing_updated_at DATETIME(6) NULL',
    'SELECT 1');
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @index_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'waste_listings'
      AND INDEX_NAME = 'idx_waste_listings_coordinator'
);
SET @migration_sql = IF(@index_exists = 0,
    'CREATE INDEX idx_waste_listings_coordinator ON waste_listings (assigned_coordinator_email)',
    'SELECT 1');
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;
