const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'farm_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    const sqlPath = path.join(__dirname, '../config/migration_livestock.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔄 Running livestock migration...');
    await connection.query(sql);

    console.log('✅ Livestock table created successfully!');
    console.log('✅ Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigration();
