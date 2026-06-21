// src/api.js — data access layer on top of Supabase.
// Keeps the rest of the app (stores, pages) free of Supabase details.
import { supabase, fileUrl, PAPERS_BUCKET, CV_BUCKET } from './lib/supabase'

// ── small helpers ─────────────────────────────────────────────────
function unwrap({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}

function randomName(originalName = '') {
  const ext = (originalName.split('.').pop() || 'pdf').toLowerCase()
  const id = (crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2))
  return `${id}.${ext}`
}

// jsonb columns come back already parsed; just guard against null.
function normalizeProject(row) {
  if (!row) return null
  return {
    ...row,
    tech: Array.isArray(row.tech) ? row.tech : [],
    links: row.links && typeof row.links === 'object' ? row.links : {},
    featured: !!row.featured,
  }
}

function normalizePaper(row) {
  if (!row) return null
  return {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : [],
    featured: !!row.featured,
    fileUrl: row.file_path ? fileUrl(PAPERS_BUCKET, row.file_path) : null,
  }
}

// ── Auth (Supabase Auth) ───────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }).then(({ data, error }) => {
      if (error) throw new Error(error.message)
      return data.user
    }),

  logout: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession().then(({ data }) => data.session),

  getUser: () => supabase.auth.getUser().then(({ data }) => data.user),

  onChange: (cb) => supabase.auth.onAuthStateChange((_event, session) => cb(session)),

  changePassword: (newPassword) =>
    supabase.auth.updateUser({ password: newPassword }).then(({ error }) => {
      if (error) throw new Error(error.message)
    }),
}

// ── Projects ───────────────────────────────────────────────────────
export const projectsApi = {
  getAll: async ({ category, featured } = {}) => {
    let q = supabase.from('projects').select('*')
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
    if (category && category !== 'All') q = q.eq('category', category)
    if (featured) q = q.eq('featured', true)
    return unwrap(await q).map(normalizeProject)
  },

  getOne: async (id) =>
    normalizeProject(unwrap(await supabase.from('projects').select('*').eq('id', id).single())),

  create: async (data) =>
    normalizeProject(unwrap(await supabase.from('projects').insert(toProjectRow(data)).select().single())),

  update: async (id, data) =>
    normalizeProject(unwrap(await supabase.from('projects').update(toProjectRow(data)).eq('id', id).select().single())),

  delete: async (id) => unwrap(await supabase.from('projects').delete().eq('id', id)),
}

function toProjectRow(d) {
  return {
    title: (d.title || '').trim(),
    short: d.short || '',
    description: d.description || '',
    category: d.category || 'Full Stack',
    tech: Array.isArray(d.tech) ? d.tech : [],
    year: String(d.year || new Date().getFullYear()),
    status: d.status || 'Live',
    color: d.color || '#00f5ff',
    links: d.links || {},
    featured: !!d.featured,
    sort_order: Number(d.sort_order) || 0,
  }
}

// ── Papers ─────────────────────────────────────────────────────────
export const papersApi = {
  getAll: async ({ featured } = {}) => {
    let q = supabase.from('papers').select('*')
      .order('sort_order', { ascending: false })
      .order('year', { ascending: false })
    if (featured) q = q.eq('featured', true)
    return unwrap(await q).map(normalizePaper)
  },

  getOne: async (id) =>
    normalizePaper(unwrap(await supabase.from('papers').select('*').eq('id', id).single())),

  create: async (data) =>
    normalizePaper(unwrap(await supabase.from('papers').insert(toPaperRow(data)).select().single())),

  update: async (id, data) =>
    normalizePaper(unwrap(await supabase.from('papers').update(toPaperRow(data)).eq('id', id).select().single())),

  delete: async (paper) => {
    if (paper.file_path) {
      await supabase.storage.from(PAPERS_BUCKET).remove([paper.file_path])
    }
    return unwrap(await supabase.from('papers').delete().eq('id', paper.id))
  },

  // Upload a PDF, returns { path, name }. Removes an old file if replacing.
  uploadFile: async (file, oldPath) => {
    const path = randomName(file.name)
    const { error } = await supabase.storage.from(PAPERS_BUCKET)
      .upload(path, file, { contentType: file.type || 'application/pdf', upsert: false })
    if (error) throw new Error(error.message)
    if (oldPath) await supabase.storage.from(PAPERS_BUCKET).remove([oldPath]).catch(() => {})
    return { path, name: file.name }
  },
}

function toPaperRow(d) {
  return {
    title: (d.title || '').trim(),
    authors: d.authors || '',
    abstract: d.abstract || '',
    venue: d.venue || '',
    year: String(d.year || new Date().getFullYear()),
    tags: Array.isArray(d.tags) ? d.tags : [],
    link: d.link || '',
    file_path: d.file_path || '',
    file_name: d.file_name || '',
    featured: !!d.featured,
    sort_order: Number(d.sort_order) || 0,
  }
}

// ── CV (entries + downloadable file via settings) ──────────────────
export const cvApi = {
  getEntries: async () =>
    unwrap(await supabase.from('cv_entries').select('*')
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true })),

  createEntry: async (data) =>
    unwrap(await supabase.from('cv_entries').insert(toCvRow(data)).select().single()),

  updateEntry: async (id, data) =>
    unwrap(await supabase.from('cv_entries').update(toCvRow(data)).eq('id', id).select().single()),

  deleteEntry: async (id) => unwrap(await supabase.from('cv_entries').delete().eq('id', id)),

  // The downloadable CV file is stored as a settings row { path, name }.
  getFile: async () => {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'cv_file').maybeSingle()
    if (error) throw new Error(error.message)
    const v = data?.value
    if (!v?.path) return null
    return { ...v, url: fileUrl(CV_BUCKET, v.path) }
  },

  uploadFile: async (file, oldPath) => {
    const path = randomName(file.name)
    const { error } = await supabase.storage.from(CV_BUCKET)
      .upload(path, file, { contentType: file.type || 'application/pdf', upsert: false })
    if (error) throw new Error(error.message)
    const value = { path, name: file.name, uploaded_at: new Date().toISOString() }
    const up = await supabase.from('settings').upsert({ key: 'cv_file', value }).select().single()
    if (up.error) throw new Error(up.error.message)
    if (oldPath) await supabase.storage.from(CV_BUCKET).remove([oldPath]).catch(() => {})
    return { ...value, url: fileUrl(CV_BUCKET, path) }
  },

  removeFile: async (oldPath) => {
    if (oldPath) await supabase.storage.from(CV_BUCKET).remove([oldPath]).catch(() => {})
    return unwrap(await supabase.from('settings').delete().eq('key', 'cv_file'))
  },
}

function toCvRow(d) {
  return {
    section: d.section || 'experience',
    role: (d.role || '').trim(),
    organization: d.organization || '',
    location: d.location || '',
    period: d.period || '',
    description: d.description || '',
    sort_order: Number(d.sort_order) || 0,
  }
}
