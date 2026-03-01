// routes/projects.js
const router = require('express').Router()
const db = require('../db/database')
const requireAuth = require('../middleware/auth')

// ── Helpers ────────────────────────────────────────────────────────
function parseProject(row) {
  if (!row) return null
  return {
    ...row,
    tech: JSON.parse(row.tech || '[]'),
    links: JSON.parse(row.links || '{}'),
    featured: row.featured === 1,
  }
}

function validateProject(data) {
  const errors = []
  if (!data.title || !data.title.trim()) errors.push('title è richiesto')
  if (data.color && !/^#[0-9a-fA-F]{3,8}$/.test(data.color)) errors.push('color deve essere un hex valido')
  return errors
}

// ── Public routes ──────────────────────────────────────────────────

// GET /api/projects — lista tutti (con filtri opzionali)
router.get('/', (req, res) => {
  const { category, featured } = req.query

  let query = 'SELECT * FROM projects'
  const params = []
  const conditions = []

  if (category && category !== 'All') {
    conditions.push('category = ?')
    params.push(category)
  }
  if (featured === 'true') {
    conditions.push('featured = 1')
  }

  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
  query += ' ORDER BY sort_order DESC, created_at DESC'

  const rows = db.prepare(query).all(...params)
  res.json(rows.map(parseProject))
})

// GET /api/projects/:id — singolo progetto
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Progetto non trovato.' })
  res.json(parseProject(row))
})

// ── Protected routes (richiedono JWT) ─────────────────────────────

// POST /api/projects — crea nuovo
router.post('/', requireAuth, (req, res) => {
  const errors = validateProject(req.body)
  if (errors.length) return res.status(400).json({ errors })

  const {
    title, short = '', description = '',
    category = 'Full Stack', tech = [],
    year = new Date().getFullYear().toString(),
    status = 'Live', color = '#00f5ff',
    links = {}, featured = false, sort_order = 0,
  } = req.body

  const result = db.prepare(`
    INSERT INTO projects (title, short, description, category, tech, year, status, color, links, featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(), short, description,
    category,
    JSON.stringify(Array.isArray(tech) ? tech : []),
    year, status, color,
    JSON.stringify(links),
    featured ? 1 : 0,
    sort_order
  )

  const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(parseProject(created))
})

// PUT /api/projects/:id — aggiorna
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Progetto non trovato.' })

  const errors = validateProject(req.body)
  if (errors.length) return res.status(400).json({ errors })

  const {
    title, short, description, category, tech,
    year, status, color, links, featured, sort_order,
  } = req.body

  db.prepare(`
    UPDATE projects SET
      title       = ?,
      short       = ?,
      description = ?,
      category    = ?,
      tech        = ?,
      year        = ?,
      status      = ?,
      color       = ?,
      links       = ?,
      featured    = ?,
      sort_order  = ?,
      updated_at  = datetime('now')
    WHERE id = ?
  `).run(
    title.trim(), short, description,
    category,
    JSON.stringify(Array.isArray(tech) ? tech : []),
    year, status, color,
    JSON.stringify(links || {}),
    featured ? 1 : 0,
    sort_order ?? 0,
    req.params.id
  )

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  res.json(parseProject(updated))
})

// DELETE /api/projects/:id
router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Progetto non trovato.' })

  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
  res.json({ message: 'Progetto eliminato.', id: parseInt(req.params.id) })
})

module.exports = router
