// db/database.js — inizializza SQLite e crea le tabelle
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const DB_DIR = path.join(__dirname, '../data')
const DB_PATH = path.join(DB_DIR, 'portfolio.db')

// Assicurati che la cartella data/ esista
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const db = new Database(DB_PATH)

// Performance pragmas
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── Schema ─────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,          -- bcrypt hash
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    short       TEXT,
    description TEXT,
    category    TEXT    NOT NULL DEFAULT 'Full Stack',
    tech        TEXT    NOT NULL DEFAULT '[]',   -- JSON array
    year        TEXT    NOT NULL DEFAULT (strftime('%Y', 'now')),
    status      TEXT    NOT NULL DEFAULT 'Live',
    color       TEXT    NOT NULL DEFAULT '#00f5ff',
    links       TEXT    NOT NULL DEFAULT '{}',   -- JSON object
    featured    INTEGER NOT NULL DEFAULT 0,       -- 0 | 1
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_projects_featured  ON projects(featured);
  CREATE INDEX IF NOT EXISTS idx_projects_category  ON projects(category);
  CREATE INDEX IF NOT EXISTS idx_projects_sort      ON projects(sort_order DESC, created_at DESC);
`)

module.exports = db
