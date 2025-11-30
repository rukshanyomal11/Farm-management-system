-- Drop existing livestock table if exists
DROP TABLE IF EXISTS livestock;

-- Create livestock table
CREATE TABLE livestock (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  farm_id VARCHAR(36) NOT NULL,
  tag_number VARCHAR(50) NOT NULL,
  name VARCHAR(100),
  type ENUM('cattle', 'poultry', 'sheep', 'goat', 'pig', 'other') NOT NULL,
  breed VARCHAR(100),
  gender ENUM('male', 'female') NOT NULL,
  birth_date DATE,
  weight DECIMAL(10,2),
  status ENUM('healthy', 'sick', 'pregnant', 'sold', 'deceased') DEFAULT 'healthy',
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_livestock_farm FOREIGN KEY (farm_id) 
    REFERENCES farms(id) ON DELETE CASCADE,
  
  CONSTRAINT unique_tag_per_farm UNIQUE (farm_id, tag_number),
  
  INDEX idx_livestock_farm (farm_id),
  INDEX idx_livestock_type (type),
  INDEX idx_livestock_status (status),
  INDEX idx_livestock_tag (tag_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
