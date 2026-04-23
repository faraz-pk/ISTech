const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'istech_db'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'istech_db'}`);

    const migrationFile = fs.readFileSync(path.join(__dirname, 'migrations/001_create_users_table.sql'), 'utf8');
    await connection.query(migrationFile);

    console.log('✅ Database setup complete!');
    await connection.end();
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();