# Database Migration: Add Viewer Role

## Steps to Add Viewer Role to Database

### Option 1: Using MySQL Command Line
```bash
mysql -u root -p farm_management < backend/config/migration_add_viewer_role.sql
```

### Option 2: Using MySQL Workbench or phpMyAdmin
1. Open your MySQL client
2. Select the `farm_management` database
3. Run the following SQL command:

```sql
USE farm_management;

ALTER TABLE users 
MODIFY COLUMN role ENUM('super_admin', 'farm_owner', 'farm_manager', 'accountant', 'field_worker', 'viewer') 
DEFAULT 'farm_owner';
```

### Option 3: Run via Node.js (Quick Fix)
Open your terminal in the backend folder and run:

```bash
cd backend
node -e "const mysql = require('mysql2/promise'); (async () => { const conn = await mysql.createConnection({host:'localhost',user:'root',password:'your_password',database:'farm_management'}); await conn.execute(\"ALTER TABLE users MODIFY COLUMN role ENUM('super_admin','farm_owner','farm_manager','accountant','field_worker','viewer') DEFAULT 'farm_owner'\"); console.log('✅ Viewer role added!'); await conn.end(); })()"
```

### Verify the Migration
Run this query to verify:
```sql
SHOW COLUMNS FROM users WHERE Field = 'role';
```

You should see 'viewer' in the ENUM values.

## After Running Migration
Restart your backend server and try registering as a viewer again!
