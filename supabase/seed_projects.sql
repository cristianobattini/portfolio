-- ============================================================
--  SEED — real projects, pulled from github.com/cristianobattini
--  Run this once in the Supabase SQL Editor, after schema.sql
--  (schema.sql must have already added the projects.logo_url
--  column and the "logos" storage bucket).
--  Safe to re-run: each insert is skipped if a project with the
--  same title already exists (e.g. because you edited it in /admin).
-- ============================================================

insert into public.projects (title, short, description, category, tech, year, status, color, logo_url, links, featured, sort_order)
select * from (values
  (
    'Astro Assistant',
    'A fullscreen terminal app for planning astrophotography nights — target scoring, shooting windows and a real observation log.',
    E'A real TUI — not a CLI with flags — built with [Textual](https://textual.textualize.io/) and Rich, backed by a genuine astronomy engine (Astropy/Astroplan) and a local SQLite database.\n\n- **Tonight dashboard**: sunset/dusk/dawn/sunrise, Moon phase & altitude, and a ranked list of the best targets for *right now* — scored on altitude, airmass, time above the horizon, Moon separation/phase, surface brightness, angular size, FOV fit, weather and guiding availability, not just magnitude.\n- **Automatic planning**: select a target and press `P` — the app finds the next clear night and builds the full shooting plan for you, obstruction-aware.\n- Ships pre-seeded with the full 110-object Messier catalog and a default telescope + camera setup, ready on first launch.',
    'Other',
    '["Python","Textual","Rich","Astropy","Astroplan","SQLModel","SQLite"]'::jsonb,
    '2026',
    'Open Source',
    '#f2a53c',
    '',
    '{"github":"https://github.com/cristianobattini/astro_assistant"}'::jsonb,
    true,
    70
  ),
  (
    'Provia',
    'Mobile companion for Italian university students — grades, CFU, averages, timetable and exam sessions, all self-tracked and private.',
    E'A React Native (Expo) app where you log your own academic data — no university login and no university password ever involved. The only account is Provia''s own (Supabase Auth), used solely to sync your data across devices.\n\n- Career, grades, CFU, weighted averages, tuition and exam sessions\n- Curated themes plus a full personalization editor, light/dark mode\n- **Provia Pro** subscription via RevenueCat, with a fully custom animated paywall\n- No custom backend — the app talks directly to [Supabase](https://supabase.com) (Postgres + Auth + PostgREST), protected end-to-end by Row Level Security',
    'Mobile',
    '["React Native","Expo","TypeScript","Supabase","Zustand","TanStack Query"]'::jsonb,
    '2026',
    'Open Source',
    '#d9622b',
    'https://raw.githubusercontent.com/cristianobattini/Provia/main/apps/mobile/assets/icon.png',
    '{"github":"https://github.com/cristianobattini/Provia"}'::jsonb,
    true,
    60
  ),
  (
    'UniTrend',
    'University tracker that connects to your ateneo via OAuth2/OIDC — grades, CFU, timetable and exam sessions, kept in sync automatically.',
    E'A full-stack monorepo: a NestJS + Prisma API with a connector architecture built to integrate real university management systems (ESSE3/CINECA, GOMP/smart_edu, more to come), paired with an Expo/React Native client.\n\n- OAuth2/OIDC login — no university password is ever stored, tokens are encrypted server-side\n- PostgreSQL + Redis, JWT auth, rate limiting and an audit log\n- Customizable primary color and light/dark mode on mobile',
    'Full Stack',
    '["NestJS","Prisma","PostgreSQL","Redis","React Native","Expo","TypeScript"]'::jsonb,
    '2026',
    'Open Source',
    '#e0485a',
    'https://raw.githubusercontent.com/cristianobattini/universita_app/claude/sleepy-planck-59jtg7/apps/mobile/assets/icons/icon-orange.png',
    '{"github":"https://github.com/cristianobattini/universita_app"}'::jsonb,
    true,
    50
  ),
  (
    'YouVault',
    'A private, encrypted vault for your credentials — local-first storage with a Face ID / biometric lock.',
    E'A secrets manager built with Expo and Realm: credentials are encrypted and stored on-device, unlocked only via Face ID or fingerprint. Nothing leaves the phone.',
    'Mobile',
    '["React Native","Expo","Realm","TypeScript","Crypto-JS"]'::jsonb,
    '2025',
    'Open Source',
    '#ffd76a',
    'https://raw.githubusercontent.com/cristianobattini/YouVault/main/assets/images/icon.png',
    '{"github":"https://github.com/cristianobattini/YouVault"}'::jsonb,
    false,
    40
  ),
  (
    'GalleryClean',
    'Swipe through your camera roll and clear it out fast — right to delete, left to keep, with undo.',
    E'An Expo app for cleaning up a cluttered photo gallery with a Tinder-style swipe gesture: swipe right to delete, left to keep, inline video preview, filters by type/album, and a review grid before anything is actually removed.',
    'Mobile',
    '["React Native","Expo","Kotlin"]'::jsonb,
    '2026',
    'Open Source',
    '#8fae4a',
    'https://raw.githubusercontent.com/cristianobattini/GalleryClean/main/assets/icon.png',
    '{"github":"https://github.com/cristianobattini/GalleryClean"}'::jsonb,
    false,
    30
  ),
  (
    'Anakin cTrader Algo',
    'An algorithmic trading bot for cTrader — precise entries, dual take-profit levels and automatic break-even.',
    E'A C# cAlgo strategy for the cTrader platform with fine-grained control over trade execution: exact or market entries, two independently-sized take-profit levels, stop-loss protection with optional break-even, risk-percent or fixed-lot position sizing, on-chart visual levels, and email/sound alerts on trade events.',
    'Other',
    '["C#","cTrader","cAlgo"]'::jsonb,
    '2025',
    'Open Source',
    '#c9863f',
    '',
    '{"github":"https://github.com/cristianobattini/Anakin-cAlgo"}'::jsonb,
    false,
    20
  ),
  (
    'Electric Field Force Lines Simulator',
    'A small physics tool that draws electric field and force lines for configurable charge setups.',
    E'A Python desktop app (PyQt5 + Matplotlib + NumPy) for visualizing electric field and force lines around arbitrary point-charge configurations — built as a teaching and visualization aid.',
    'Other',
    '["Python","NumPy","Matplotlib","PyQt5"]'::jsonb,
    '2025',
    'Open Source',
    '#4a7a6b',
    '',
    '{"github":"https://github.com/cristianobattini/electric_field_force_lines_sim"}'::jsonb,
    false,
    10
  )
) as v(title, short, description, category, tech, year, status, color, logo_url, links, featured, sort_order)
where not exists (
  select 1 from public.projects p where p.title = v.title
);
