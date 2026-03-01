// middleware/auth.js
const jwt = require('jsonwebtoken')

module.exports = function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  if (!token) {
    return res.status(401).json({ error: 'Token mancante. Effettua il login.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = payload
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sessione scaduta. Effettua nuovamente il login.' })
    }
    return res.status(403).json({ error: 'Token non valido.' })
  }
}
