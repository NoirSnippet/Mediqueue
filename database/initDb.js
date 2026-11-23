// database setup script - creates database, runs schema.sql and seed.sql
const fs = require('fs');
const path = require('path');

let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  try {
    mysql = require(path.join(__dirname, '../backend/node_modules/mysql2/promise'));
  } catch (err2) {
    console.error('Could not find mysql2. Please run "npm install" inside backend directory.');
    process.exit(1);
  }
}

try {
  require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
} catch (e) {
  try {
    require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
  } catch (_) {}
}

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

const DB_NAME = process.env.DB_NAME || 'mediqueue_db';

async function runDatabaseInitialization() {
  console.log(`Connecting to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}...`);

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
  } catch (err) {
    console.error('Could not connect to MySQL server:', err.message);
    console.log('Check that MySQL is running in XAMPP and credentials match in backend/.env');
    process.exit(1);
  }

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.changeUser({ database: DB_NAME });

    console.log('Creating tables from schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);

    console.log('Inserting seed data from seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await connection.query(seedSql);

    console.log('Database initialized successfully with sample doctors, clinics, and accounts.');
  } catch (err) {
    console.error('Error during database setup:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  runDatabaseInitialization();
}

module.exports = runDatabaseInitialization;
