// api.js — Client HTTP per le API del backend

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// ── Token management ──────────────────────────────────────────────
export const tokenStore = {
  get: () => sessionStorage.getItem('portfolio_token'),
  set: (t) => sessionStorage.setItem('portfolio_token', t),
  clear: () => sessionStorage.removeItem('portfolio_token'),
}

// ── Fetch helper ──────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = tokenStore.get()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    const msg = data.error || data.errors?.join(', ') || 'Errore sconosciuto'
    throw new Error(msg)
  }

  return data
}

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => apiFetch('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

// ── Projects ──────────────────────────────────────────────────────
export const projectsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    return apiFetch(`/projects${qs ? '?' + qs : ''}`)
  },

  getOne: (id) => apiFetch(`/projects/${id}`),

  create: (data) =>
    apiFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiFetch(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiFetch(`/projects/${id}`, { method: 'DELETE' }),
}
