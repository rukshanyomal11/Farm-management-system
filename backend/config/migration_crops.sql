-- Crops Management Table
-- Run this SQL to create the crops table

-- Drop tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS crops;
DROP TABLE IF EXISTS fields;

-- Fields Table
CREATE TABLE fields (
  id VARCHAR(36) NOT NULL,
  farm_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  size DECIMAL(10, 2) NOT NULL COMMENT 'Size in acres or hectares',
  location VARCHAR(255) NULL,
  soil_type VARCHAR(50) NULL,
  irrigation_type VARCHAR(50) NULL,
  status ENUM('active', 'fallow', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_farm_id (farm_id),
  CONSTRAINT fk_fields_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crops Table
CREATE TABLE crops (
  id VARCHAR(36) NOT NULL,
  farm_id VARCHAR(36) NOT NULL,
  field_id VARCHAR(36) NULL,
  crop_name VARCHAR(100) NOT NULL,
  variety VARCHAR(100) NULL,
  area_planted DECIMAL(10, 2) NULL COMMENT 'Area in acres or hectares',
  planting_date DATE NOT NULL,
  expected_harvest_date DATE NULL,
  actual_harvest_date DATE NULL,
  status ENUM('planted', 'growing', 'ready', 'harvested', 'failed') DEFAULT 'planted',
  yield_amount DECIMAL(10, 2) NULL COMMENT 'Yield in kg or tons',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_farm_id (farm_id),
  INDEX idx_field_id (field_id),
  INDEX idx_status (status),
  INDEX idx_planting_date (planting_date),
  CONSTRAINT fk_crops_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  CONSTRAINT fk_crops_field FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
