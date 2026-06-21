// src/store.js — Zustand stores backed by Supabase
import { create } from 'zustand'
import { projectsApi, papersApi, cvApi, authApi } from './api'

// ── Projects Store ─────────────────────────────────────────────────
export const useProjectStore = create((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const projects = await projectsApi.getAll(params)
      set({ projects, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  getProject: (id) => get().projects.find(p => String(p.id) === String(id)),

  addProject: async (data) => {
    const project = await projectsApi.create(data)
    set(state => ({ projects: [project, ...state.projects] }))
    return project
  },

  updateProject: async (id, data) => {
    const updated = await projectsApi.update(id, data)
    set(state => ({
      projects: state.projects.map(p => String(p.id) === String(id) ? updated : p),
    }))
    return updated
  },

  deleteProject: async (id) => {
    await projectsApi.delete(id)
    set(state => ({
      projects: state.projects.filter(p => String(p.id) !== String(id)),
    }))
  },
}))

// ── Papers Store ───────────────────────────────────────────────────
export const usePaperStore = create((set, get) => ({
  papers: [],
  loading: false,
  error: null,

  fetchPapers: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const papers = await papersApi.getAll(params)
      set({ papers, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  getPaper: (id) => get().papers.find(p => String(p.id) === String(id)),

  addPaper: async (data) => {
    const paper = await papersApi.create(data)
    set(state => ({ papers: [paper, ...state.papers] }))
    return paper
  },

  updatePaper: async (id, data) => {
    const updated = await papersApi.update(id, data)
    set(state => ({
      papers: state.papers.map(p => String(p.id) === String(id) ? updated : p),
    }))
    return updated
  },

  deletePaper: async (paper) => {
    await papersApi.delete(paper)
    set(state => ({
      papers: state.papers.filter(p => String(p.id) !== String(paper.id)),
    }))
  },
}))

// ── CV Store ───────────────────────────────────────────────────────
export const useCvStore = create((set) => ({
  entries: [],
  file: null,
  loading: false,
  error: null,

  fetchCv: async () => {
    set({ loading: true, error: null })
    try {
      const [entries, file] = await Promise.all([cvApi.getEntries(), cvApi.getFile()])
      set({ entries, file, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  addEntry: async (data) => {
    const entry = await cvApi.createEntry(data)
    set(state => ({ entries: [...state.entries, entry] }))
    return entry
  },

  updateEntry: async (id, data) => {
    const updated = await cvApi.updateEntry(id, data)
    set(state => ({
      entries: state.entries.map(e => String(e.id) === String(id) ? updated : e),
    }))
    return updated
  },

  deleteEntry: async (id) => {
    await cvApi.deleteEntry(id)
    set(state => ({ entries: state.entries.filter(e => String(e.id) !== String(id)) }))
  },

  setFile: (file) => set({ file }),
}))

// ── Auth Store (Supabase Auth) ─────────────────────────────────────
export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  ready: false,        // true once we've checked the initial session
  loading: false,
  error: null,

  init: async () => {
    const session = await authApi.getSession()
    set({ isAuthenticated: !!session, user: session?.user || null, ready: true })
    authApi.onChange((s) => {
      set({ isAuthenticated: !!s, user: s?.user || null })
    })
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const user = await authApi.login(email, password)
      set({ isAuthenticated: true, user, loading: false })
      return true
    } catch (err) {
      set({ error: err.message, loading: false })
      return false
    }
  },

  logout: async () => {
    await authApi.logout()
    set({ isAuthenticated: false, user: null })
  },

  clearError: () => set({ error: null }),
}))
