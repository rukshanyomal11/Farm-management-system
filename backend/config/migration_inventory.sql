-- Drop existing inventory table if exists
DROP TABLE IF EXISTS inventory;

-- Create inventory table
CREATE TABLE inventory (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  farm_id VARCHAR(36) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  category ENUM('feed', 'fertilizer', 'seeds', 'medicine', 'equipment', 'tools', 'fuel', 'other') NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit ENUM('kg', 'lbs', 'liters', 'gallons', 'bags', 'pieces', 'boxes', 'tons', 'meters', 'other') NOT NULL,
  unit_price DECIMAL(10,2),
  total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  reorder_level DECIMAL(10,2),
  supplier_name VARCHAR(100),
  supplier_contact VARCHAR(50),
  location VARCHAR(100),
  purchase_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_inventory_farm FOREIGN KEY (farm_id) 
    REFERENCES farms(id) ON DELETE CASCADE,
  
  INDEX idx_inventory_farm (farm_id),
  INDEX idx_inventory_category (category),
  INDEX idx_inventory_item_name (item_name),
  INDEX idx_inventory_quantity (quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
