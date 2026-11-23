const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mediqueue_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true, // Return dates as strings to avoid UTC offset shifts
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

const pool = mysql.createPool(dbConfig);

// Helper function to test DB connection on server startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL (${dbConfig.host}:${dbConfig.port}, DB: ${dbConfig.database})`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[Database] Warning: Could not connect to MySQL at ${dbConfig.host}:${dbConfig.port}`);
    console.error(`[Database] Error message: ${error.message}`);
    console.error(`[Database] Make sure MySQL service / XAMPP is started and "npm run db:init" has been executed.`);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};
