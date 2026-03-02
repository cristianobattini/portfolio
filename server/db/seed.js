// db/seed.js — eseguito una volta sola con: node db/seed.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcrypt')
const { pool, initDB } = require('./database')

async function seed() {
  console.log('🌱 Seeding database...\n')

  await initDB()

  // ── Admin ─────────────────────────────────────────────────────────
  const [existingRows] = await pool.execute(
    'SELECT id FROM admins WHERE username = ?',
    [process.env.ADMIN_USERNAME || 'admin']
  )

  if (!existingRows[0]) {
    const plainPassword = process.env.ADMIN_PASSWORD || 'cosmos2024'
    const hash = await bcrypt.hash(plainPassword, 12)

    await pool.execute(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      [process.env.ADMIN_USERNAME || 'admin', hash]
    )
    console.log(`✅ Admin creato: ${process.env.ADMIN_USERNAME || 'admin'}`)
    console.log(`   Password: [hashata con bcrypt, 12 rounds]`)
  } else {
    console.log('ℹ️  Admin già esistente, skip.')
  }

  // ── Sample Projects ───────────────────────────────────────────────
  const [countRows] = await pool.execute('SELECT COUNT(*) as n FROM projects')
  const count = countRows[0].n

  console.log("Projects: ", count)

  console.log('\n🚀 Database pronto! Avvia il server con: npm run dev')
  await pool.end()
}

seed().catch(err => {
  console.error('❌ Seed fallito:', err)
  process.exit(1)
})
