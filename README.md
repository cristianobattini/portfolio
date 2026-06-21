# 🚀 Space Portfolio v3 — Supabase

Personal portfolio with a 3D space theme, now fully powered by **Supabase**
(Postgres + Auth + Storage). No custom backend server — the React app talks to
Supabase directly, protected by Row Level Security.

Includes **Projects**, a **Papers / Research** section (upload & showcase PDFs),
and a **CV** section (timeline + downloadable PDF).

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Three.js + Zustand |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (email/password) |
| File storage | Supabase Storage (paper & CV PDFs) |
| Security | Row Level Security — public read, authenticated write |

---

## ⚡ Requirements

- **Node.js v18+** → [nodejs.org](https://nodejs.org)
- A free **Supabase** project → [supabase.com](https://supabase.com)

---

## 🛠️ Setup

### 1. Create a Supabase project
At [supabase.com](https://supabase.com) → New project. Grab the **Project URL**
and **anon public key** from *Project Settings → API*.

### 2. Run the schema
Open *Dashboard → SQL Editor*, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the
tables (`projects`, `papers`, `cv_entries`, `settings`), the RLS policies, and
the public `papers` / `cv` storage buckets.

### 3. Create your admin user
*Dashboard → Authentication → Users → Add user* (email + password).
That email/password is what you'll use to log into `/admin`.

### 4. Configure the frontend
```bash
cp client/.env.example client/.env
# then edit client/.env with your Supabase URL + anon key and personal info
```

### 5. Install & run
```bash
npm run install:all   # installs root + client deps
npm run dev           # http://localhost:5173
```

---

## ▶️ Usage

- **Public site:** Home, Projects, Papers, CV.
- **Admin panel:** go to `/admin`, log in with your Supabase user.
  - **Projects** — create/edit/delete portfolio projects.
  - **Papers** — upload PDFs, add abstract/authors/venue/tags, feature on home.
  - **CV** — upload a downloadable CV PDF and manage the experience/education timeline.

> The CV "skills" list and contact links come from `client/.env`
> (`VITE_SKILLS`, `VITE_EMAIL`, …). The timeline + CV PDF come from Supabase.

---

## 🔐 Security model

- **Reads** (projects, papers, CV, files) are public — anyone can view the site.
- **Writes** (insert/update/delete + file uploads) require an authenticated
  Supabase session, enforced by Row Level Security and Storage policies.
- The anon key in `client/.env` is safe to ship to the browser; RLS is what
  protects your data. Never expose the **service_role** key in the frontend.

---

## 📁 Structure

```
portfolio/
├── package.json              ← Runner (delegates to client)
├── supabase/
│   └── schema.sql            ← Tables + RLS + storage buckets (run once)
└── client/
    ├── .env                  ← Supabase keys + personal info (not committed)
    ├── lib/supabase.js       ← Supabase client
    ├── api.js                ← Data access layer (projects, papers, cv, auth)
    ├── store.js              ← Zustand stores
    ├── components/           ← Nav, ProjectCard, PaperCard, SpaceBackground...
    └── pages/                ← Home, Projects, Papers, CV, Admin...
```

---

## 📦 Build for production

```bash
npm run build   # generates client/dist/
```

Deploy `client/dist/` to any static host (Vercel, Netlify, Cloudflare Pages,
GitHub Pages). Set the `VITE_*` environment variables in the host's dashboard.
No server to run — Supabase is the backend.
