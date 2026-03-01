// db/seed.js — eseguito una volta sola con: node db/seed.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcrypt')
const db = require('./database')

async function seed() {
  console.log('🌱 Seeding database...\n')

  // ── Admin ─────────────────────────────────────────────────────────
  const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(
    process.env.ADMIN_USERNAME || 'admin'
  )

  if (!existing) {
    const plainPassword = process.env.ADMIN_PASSWORD || 'cosmos2024'
    const hash = await bcrypt.hash(plainPassword, 12)

    db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run(
      process.env.ADMIN_USERNAME || 'admin',
      hash
    )
    console.log(`✅ Admin creato: ${process.env.ADMIN_USERNAME || 'admin'}`)
    console.log(`   Password: [hashata con bcrypt, 12 rounds]`)
  } else {
    console.log('ℹ️  Admin già esistente, skip.')
  }

  // ── Sample Projects ───────────────────────────────────────────────
  const count = db.prepare('SELECT COUNT(*) as n FROM projects').get().n

  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO projects (title, short, description, category, tech, year, status, color, links, featured, sort_order)
      VALUES (@title, @short, @description, @category, @tech, @year, @status, @color, @links, @featured, @sort_order)
    `)

    const projects = [
      {
        title: 'Nebula Dashboard',
        short: 'Real-time analytics platform with AI-powered insights',
        description: 'Una dashboard di analytics in tempo reale costruita con React e WebSocket. Integra modelli ML per fornire previsioni predittive e anomaly detection. L\'interfaccia è completamente personalizzabile con drag-and-drop.',
        category: 'Full Stack',
        tech: JSON.stringify(['React', 'TypeScript', 'WebSocket', 'Python', 'TensorFlow']),
        year: '2024',
        status: 'Live',
        color: '#00f5ff',
        links: JSON.stringify({ github: 'https://github.com', live: 'https://example.com' }),
        featured: 1,
        sort_order: 3,
      },
      {
        title: 'Void API',
        short: 'High-performance REST API serving 10M+ requests/day',
        description: 'API RESTful ad alte prestazioni costruita con Node.js e Fastify. Implementa caching avanzato con Redis, rate limiting, autenticazione JWT e documentazione automatica con OpenAPI.',
        category: 'Backend',
        tech: JSON.stringify(['Node.js', 'Fastify', 'Redis', 'PostgreSQL', 'Docker', 'K8s']),
        year: '2024',
        status: 'Live',
        color: '#7b2fff',
        links: JSON.stringify({ github: 'https://github.com', live: null }),
        featured: 1,
        sort_order: 2,
      },
      {
        title: 'Stellar UI Kit',
        short: 'Open-source component library with 60+ components',
        description: 'Una libreria di componenti React con oltre 60 componenti completamente accessibili e personalizzabili. Include un design system completo, dark mode, animazioni fluide e supporto TypeScript.',
        category: 'Frontend',
        tech: JSON.stringify(['React', 'TypeScript', 'Storybook', 'Radix UI']),
        year: '2023',
        status: 'Open Source',
        color: '#ff2d78',
        links: JSON.stringify({ github: 'https://github.com', live: 'https://example.com' }),
        featured: 0,
        sort_order: 1,
      },
    ]

    const insertMany = db.transaction((rows) => rows.forEach(r => insert.run(r)))
    insertMany(projects)
    console.log(`✅ ${projects.length} progetti di esempio inseriti`)
  } else {
    console.log(`ℹ️  Progetti già presenti (${count}), skip.`)
  }

  console.log('\n🚀 Database pronto! Avvia il server con: npm run dev')
}

seed().catch(err => {
  console.error('❌ Seed fallito:', err)
  process.exit(1)
})
