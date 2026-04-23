const pool = require('../config/database');

async function createTables() {
  try {
    const connection = await pool.getConnection();

    // Drop table if exists (for testing)
    // await connection.execute('DROP TABLE IF EXISTS users');

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        courseInterest VARCHAR(100),
        learningMode VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(email)
      )
    `);

    console.log('✅ Users table created successfully');
    connection.release();
  } catch (error) {
    console.warn('⚠️  Database not available. Skipping table creation. Make sure MySQL is running on localhost:3306');
  }
}

// Run on startup (non-blocking)
createTables().catch(err => {
  console.warn('⚠️  Database initialization failed. The app will continue to run.');
});