-- Create workers table to store worker/manager specific data
CREATE TABLE IF NOT EXISTS workers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    farm_id VARCHAR(36) NOT NULL,
    worker_type ENUM('field_worker', 'farm_manager') NOT NULL,
    specialization VARCHAR(100),
    experience_years INT DEFAULT 0,
    date_joined DATE NOT NULL,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_worker (user_id, farm_id),
    INDEX idx_farm_worker (farm_id, worker_type),
    INDEX idx_worker_status (status),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing farm_members to workers table
INSERT INTO workers (id, user_id, farm_id, worker_type, date_joined, status)
SELECT 
    UUID() as id,
    fm.user_id,
    fm.farm_id,
    CASE 
        WHEN u.role = 'farm_manager' THEN 'farm_manager'
        ELSE 'field_worker'
    END as worker_type,
    COALESCE(DATE(fm.joined_at), CURDATE()) as date_joined,
    'active' as status
FROM farm_members fm
INNER JOIN users u ON fm.user_id = u.id
WHERE u.role IN ('field_worker', 'farm_manager')
  AND NOT EXISTS (
    SELECT 1 FROM workers w 
    WHERE w.user_id = fm.user_id AND w.farm_id = fm.farm_id
  );
