// src/store.js — Zustand stores che parlano col backend
import { create } from 'zustand'
import { projectsApi, authApi, tokenStore } from './api'

// ── Projects Store ─────────────────────────────────────────────────
export const useProjectStore = create((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  // Carica tutti i progetti
  fetchProjects: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const projects = await projectsApi.getAll(params)
      set({ projects, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  // Progetto singolo (dalla lista in cache o fetch)
  getProject: (id) => get().projects.find(p => String(p.id) === String(id)),

  // Aggiunge progetto via API
  addProject: async (data) => {
    const project = await projectsApi.create(data)
    set(state => ({ projects: [project, ...state.projects] }))
    return project
  },

  // Aggiorna progetto via API
  updateProject: async (id, data) => {
    const updated = await projectsApi.update(id, data)
    set(state => ({
      projects: state.projects.map(p => String(p.id) === String(id) ? updated : p),
    }))
    return updated
  },

  // Elimina progetto via API
  deleteProject: async (id) => {
    await projectsApi.delete(id)
    set(state => ({
      projects: state.projects.filter(p => String(p.id) !== String(id)),
    }))
  },
}))

// ── Auth Store ────────────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  isAuthenticated: !!tokenStore.get(),
  admin: null,
  loading: false,
  error: null,

  // Login: manda username+password, salva JWT
  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const { token, admin } = await authApi.login(username, password)
      tokenStore.set(token)
      set({ isAuthenticated: true, admin, loading: false })
      return true
    } catch (err) {
      set({ error: err.message, loading: false })
      return false
    }
  },

  // Logout: rimuove token
  logout: () => {
    tokenStore.clear()
    set({ isAuthenticated: false, admin: null })
  },

  // Verifica token ancora valido
  checkAuth: async () => {
    if (!tokenStore.get()) return
    try {
      const { admin } = await authApi.me()
      set({ isAuthenticated: true, admin })
    } catch {
      tokenStore.clear()
      set({ isAuthenticated: false, admin: null })
    }
  },

  clearError: () => set({ error: null }),
}))
