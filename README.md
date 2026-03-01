# 🚀 Space Portfolio v2 — con Backend SQL

Portfolio personale con tema spaziale 3D, backend Express + SQLite, password hashata con bcrypt, autenticazione JWT.

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + Vite + Three.js + Zustand |
| Backend | Node.js + Express |
| Database | SQLite (file locale `server/data/portfolio.db`) |
| Auth | JWT + bcrypt (12 rounds) |
| Dev runner | concurrently (frontend + backend in un comando) |

---

## ⚡ Requisiti

- **Node.js v18+** → [nodejs.org](https://nodejs.org)
- **npm v9+** (incluso con Node)

---

## 🛠️ Setup iniziale (una volta sola)

```bash
# 1. Installa tutte le dipendenze (root + server + client)
npm run install:all

# 2. Crea il database e l'utente admin con password hashata
npm run setup
```

L'utente admin viene creato con le credenziali in `server/.env`:
- Username: `admin`
- Password: `cosmos2024` (hashata con bcrypt, 12 rounds)

---

## ▶️ Avvio in sviluppo

```bash
npm run dev
```

Questo avvia contemporaneamente:
- **Backend API** → http://localhost:3001
- **Frontend** → http://localhost:5173

---

## ⚙️ Configurazione

### `server/.env` — Backend
```env
PORT=3001
JWT_SECRET=cambia_con_stringa_random_lunga   # ← IMPORTANTE in produzione!
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=cosmos2024
```

> **Nota:** dopo il primo `npm run setup`, la password è salvata come hash nel DB.
> Cambia `ADMIN_PASSWORD` nel `.env` e riesegui `node server/db/seed.js` solo se vuoi ricreare l'admin.

### `client/.env` — Frontend
```env
VITE_NAME=Il Tuo Nome
VITE_ROLE=Il Tuo Ruolo
VITE_EMAIL=tua@email.com
VITE_GITHUB=https://github.com/tuousername
VITE_SKILLS=React,TypeScript,Node.js
# ...
```

---

## 🔐 Sicurezza

- Password hashata con **bcrypt** (12 rounds, ~300ms/hash)
- Autenticazione via **JWT** (scade in 24h di default)
- Token salvato in **sessionStorage** (sparisce alla chiusura del browser)
- Endpoint admin protetti da middleware `requireAuth`
- **Cambio password** disponibile dal pannello admin

---

## 📁 Struttura

```
portfolio-v2/
├── package.json              ← Runner principale (concurrently)
├── server/
│   ├── index.js              ← Express app
│   ├── .env                  ← Config server (non committare!)
│   ├── db/
│   │   ├── database.js       ← Schema SQLite
│   │   └── seed.js           ← Crea admin + progetti esempio
│   ├── middleware/
│   │   └── auth.js           ← Verifica JWT
│   ├── routes/
│   │   ├── auth.js           ← POST /login, GET /me, POST /change-password
│   │   └── projects.js       ← CRUD progetti
│   └── data/
│       └── portfolio.db      ← Database SQLite (creato al setup)
└── client/
    ├── src/
    │   ├── api.js            ← Client HTTP
    │   ├── store.js          ← Zustand (chiama API)
    │   ├── components/       ← Nav, SpaceBackground, ProjectCard, Cursor
    │   └── pages/            ← Home, Projects, ProjectDetail, Admin
    └── .env                  ← Config frontend (info personali)
```

---

## 🌐 API Endpoints

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login → ritorna JWT |
| GET | `/api/auth/me` | ✅ | Verifica token |
| POST | `/api/auth/change-password` | ✅ | Cambia password |
| GET | `/api/projects` | ❌ | Lista progetti |
| GET | `/api/projects/:id` | ❌ | Singolo progetto |
| POST | `/api/projects` | ✅ | Crea progetto |
| PUT | `/api/projects/:id` | ✅ | Aggiorna progetto |
| DELETE | `/api/projects/:id` | ✅ | Elimina progetto |

---

## 📦 Build per produzione

```bash
# Build del frontend
npm run build   # genera client/dist/

# Il server Express serve anche il frontend in produzione
# Imposta NODE_ENV=production nel server/.env
```

### Deploy su VPS / Railway / Render

1. Imposta le variabili d'ambiente del server nel pannello del provider
2. `npm run install:all && npm run setup`
3. `cd server && npm start`

> ⚠️ In produzione, usa un `JWT_SECRET` lungo e casuale (es: `openssl rand -hex 64`)
