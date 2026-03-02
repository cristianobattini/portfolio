// routes/projects.js
const router = require('express').Router()
const { pool } = require('../db/database')
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
router.get('/', async (req, res) => {
  try {
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

    const [rows] = await pool.execute(query, params)
    res.json(rows.map(parseProject))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore database.' })
  }
})

// GET /api/projects/:id — singolo progetto
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Progetto non trovato.' })
    res.json(parseProject(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore database.' })
  }
})

// ── Protected routes (richiedono JWT) ─────────────────────────────

// POST /api/projects — crea nuovo
router.post('/', requireAuth, async (req, res) => {
  const errors = validateProject(req.body)
  if (errors.length) return res.status(400).json({ errors })

  const {
    title, short = '', description = '',
    category = 'Full Stack', tech = [],
    year = new Date().getFullYear().toString(),
    status = 'Live', color = '#00f5ff',
    links = {}, featured = false, sort_order = 0,
  } = req.body

  try {
    const [result] = await pool.execute(`
      INSERT INTO projects (title, short, description, category, tech, year, status, color, links, featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title.trim(), short, description,
      category,
      JSON.stringify(Array.isArray(tech) ? tech : []),
      year, status, color,
      JSON.stringify(links),
      featured ? 1 : 0,
      sort_order,
    ])

    const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [result.insertId])
    res.status(201).json(parseProject(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore database.' })
  }
})

// PUT /api/projects/:id — aggiorna
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT id FROM projects WHERE id = ?', [req.params.id])
    if (!existing[0]) return res.status(404).json({ error: 'Progetto non trovato.' })

    const errors = validateProject(req.body)
    if (errors.length) return res.status(400).json({ errors })

    const {
      title, short, description, category, tech,
      year, status, color, links, featured, sort_order,
    } = req.body

    await pool.execute(`
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
        updated_at  = NOW()
      WHERE id = ?
    `, [
      title.trim(), short, description,
      category,
      JSON.stringify(Array.isArray(tech) ? tech : []),
      year, status, color,
      JSON.stringify(links || {}),
      featured ? 1 : 0,
      sort_order ?? 0,
      req.params.id,
    ])

    const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [req.params.id])
    res.json(parseProject(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore database.' })
  }
})

// DELETE /api/projects/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT id FROM projects WHERE id = ?', [req.params.id])
    if (!existing[0]) return res.status(404).json({ error: 'Progetto non trovato.' })

    await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id])
    res.json({ message: 'Progetto eliminato.', id: parseInt(req.params.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore database.' })
  }
})

module.exports = router
