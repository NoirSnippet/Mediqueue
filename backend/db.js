/**
 * MediQueue MySQL Database Connector
 * Safe wrapper delegating query, getConnection, and pool methods
 */
const { pool, testConnection } = require('./config/db');

module.exports = {
  query: (...args) => pool.query(...args),
  execute: (...args) => pool.execute(...args),
  getConnection: (...args) => pool.getConnection(...args),
  end: (...args) => pool.end(...args),
  pool,
  testConnection,
};
