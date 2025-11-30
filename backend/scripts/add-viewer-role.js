const mysql = require('mysql2/promise');
require('dotenv').config();

async function addViewerRole() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'farm_management'
    });

    console.log('📦 Connected to database...');

    // Add viewer role to ENUM
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('super_admin', 'farm_owner', 'farm_manager', 'accountant', 'field_worker', 'viewer') 
      DEFAULT 'farm_owner'
    `);

    console.log('✅ Successfully added "viewer" role to users table!');

    // Verify the change
    const [rows] = await connection.execute(
      "SHOW COLUMNS FROM users WHERE Field = 'role'"
    );

    console.log('\n📋 Current role column definition:');
    console.log(rows[0]);

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('duplicate')) {
      console.log('ℹ️  Viewer role already exists in the database.');
    } else {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Migration completed successfully!');
    }
  }
}

// Run migration
addViewerRole();
