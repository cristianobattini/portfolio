// index.js — Entry point del server
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ─────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logger (solo in dev)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const ts = new Date().toISOString().slice(11, 19)
    console.log(`[${ts}] ${req.method} ${req.path}`)
    next()
  })
}

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/projects', require('./routes/projects'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// 404 per route API sconosciute
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato.' })
})

// ── Servire frontend in produzione ────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ── Error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Errore interno del server.' })
})

// ── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server avviato su http://localhost:${PORT}`)
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Database: ./data/portfolio.db`)
  console.log(`   Frontend: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`)
})
