// routes/auth.js
const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db/database')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password richiesti.' })
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username)

  if (!admin) {
    // Stesso tempo di risposta per evitare timing attacks
    await bcrypt.hash('dummy', 12)
    return res.status(401).json({ error: 'Credenziali non valide.' })
  }

  const valid = await bcrypt.compare(password, admin.password)

  if (!valid) {
    return res.status(401).json({ error: 'Credenziali non valide.' })
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )

  res.json({
    token,
    admin: { id: admin.id, username: admin.username },
  })
})

// POST /api/auth/change-password  (richiede token)
const requireAuth = require('../middleware/auth')
router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Entrambe le password sono richieste.' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'La nuova password deve avere almeno 8 caratteri.' })
  }

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id)
  const valid = await bcrypt.compare(currentPassword, admin.password)

  if (!valid) {
    return res.status(401).json({ error: 'Password attuale non corretta.' })
  }

  const sameAsOld = await bcrypt.compare(newPassword, admin.password)
  if (sameAsOld) {
    return res.status(400).json({ error: 'La nuova password non può essere uguale a quella attuale.' })
  }

  const hash = await bcrypt.hash(newPassword, 12)
  db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hash, req.admin.id)

  res.json({ message: 'Password aggiornata con successo.' })
})

// GET /api/auth/me  — verifica token e ritorna info admin
router.get('/me', requireAuth, (req, res) => {
  res.json({ admin: req.admin })
})

module.exports = router
