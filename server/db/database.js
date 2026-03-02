// db/database.js — connessione MySQL (AWS RDS)
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
})

// ── Schema ─────────────────────────────────────────────────────────
async function initDB() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      username   VARCHAR(255) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      short       TEXT,
      description TEXT,
      category    VARCHAR(100) NOT NULL DEFAULT 'Full Stack',
      tech        VARCHAR(5000) NOT NULL DEFAULT '[]',
      year        VARCHAR(4) NOT NULL DEFAULT '2024',
      status      VARCHAR(50) NOT NULL DEFAULT 'Live',
      color       VARCHAR(20) NOT NULL DEFAULT '#00f5ff',
      links       VARCHAR(5000) NOT NULL DEFAULT '{}',
      featured    TINYINT(1) NOT NULL DEFAULT 0,
      sort_order  INT NOT NULL DEFAULT 0,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_projects_featured (featured),
      INDEX idx_projects_category (category),
      INDEX idx_projects_sort (sort_order, created_at)
    )
  `)

  console.log('   Database: connesso a MySQL ✓')
}

module.exports = { pool, initDB }
