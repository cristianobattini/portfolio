import { useState, useEffect } from 'react'
import { useProjectStore, useAuthStore } from '../store'
import { authApi } from '../api'
import './Admin.css'

const CATEGORIES = ['Full Stack', 'Frontend', 'Backend', 'Mobile', 'Other']
const COLORS = ['#00f5ff', '#7b2fff', '#ff2d78', '#ffd60a', '#22d55e', '#ff6b35']

// ── Login Gate ────────────────────────────────────────────────────
function LoginGate() {
  const { login, loading, error, clearError } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)

  const handleSubmit = async () => {
    const ok = await login(username, password)
    if (!ok) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div className="login page-enter">
      <div className="login__card glass" data-shake={shake}>
        <div className="login__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 className="login__title">Mission Control</h1>
        <p className="login__sub">Restricted area. Authentication required.</p>

        <div className={`login__field ${error ? 'login__field--error' : ''}`}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => { setUsername(e.target.value); clearError() }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>

        <div className={`login__field ${error ? 'login__field--error' : ''}`}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); clearError() }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <p className="login__error mono">// {error}</p>}

        <button className="btn btn--primary login__btn" onClick={handleSubmit} disabled={loading}>
          {loading ? '// authenticating...' : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Authenticate
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Change Password Modal ─────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setErr(null)
    if (form.next !== form.confirm) return setErr('Le nuove password non coincidono.')
    if (form.next.length < 8) return setErr('Minimo 8 caratteri.')
    setLoading(true)
    try {
      await authApi.changePassword(form.current, form.next)
      setMsg('Password aggiornata! Effettua di nuovo il login.')
      setTimeout(onClose, 2000)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal glass" onClick={e => e.stopPropagation()}>
        <h3>Cambia Password</h3>
        <p style={{ marginBottom: '1.5rem' }}>La nuova password verrà hashata con bcrypt.</p>

        {['current', 'next', 'confirm'].map((field, i) => (
          <div key={field} className="pform__field" style={{ marginBottom: '1rem' }}>
            <label>{['Password attuale', 'Nuova password', 'Conferma nuova password'][i]}</label>
            <input
              type="password"
              value={form[field]}
              onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
              placeholder={i === 0 ? '••••••••' : 'Minimo 8 caratteri'}
            />
          </div>
        ))}

        {err && <p className="login__error mono" style={{ textAlign: 'left', marginBottom: '1rem' }}>// {err}</p>}
        {msg && <p style={{ color: 'var(--plasma)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '1rem' }}>{msg}</p>}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn btn--primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva'}
          </button>
          <button className="btn btn--ghost" onClick={onClose}>Annulla</button>
        </div>
      </div>
    </div>
  )
}

// ── Project Form ──────────────────────────────────────────────────
const emptyForm = {
  title: '', short: '', description: '', category: 'Full Stack',
  tech: '', year: new Date().getFullYear().toString(), status: 'Live',
  color: '#00f5ff', featured: false,
  links: { github: '', live: '' },
}

function ProjectForm({ initial = emptyForm, onSave, onCancel, submitLabel = 'Launch Project', saving }) {
  const [form, setForm] = useState({
    ...initial,
    tech: Array.isArray(initial.tech) ? initial.tech.join(', ') : initial.tech,
  })

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))
  const setLink = (field, val) => setForm(prev => ({ ...prev, links: { ...prev.links, [field]: val } }))

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({
      ...form,
      tech: typeof form.tech === 'string'
        ? form.tech.split(',').map(t => t.trim()).filter(Boolean)
        : form.tech,
    })
  }

  return (
    <div className="pform glass">
      <div className="pform__grid">
        <div className="pform__field pform__field--full">
          <label>Project Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="My Awesome Project" />
        </div>
        <div className="pform__field pform__field--full">
          <label>Short Description</label>
          <input value={form.short} onChange={e => set('short', e.target.value)} placeholder="One-line description" />
        </div>
        <div className="pform__field pform__field--full">
          <label>Full Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Detailed description..." />
        </div>
        <div className="pform__field">
          <label>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="pform__field">
          <label>Status</label>
          <input value={form.status} onChange={e => set('status', e.target.value)} placeholder="Live / WIP / Open Source" />
        </div>
        <div className="pform__field">
          <label>Year</label>
          <input value={form.year} onChange={e => set('year', e.target.value)} placeholder="2024" />
        </div>
        <div className="pform__field pform__field--full">
          <label>Tech Stack (comma separated)</label>
          <input value={form.tech} onChange={e => set('tech', e.target.value)} placeholder="React, TypeScript, Node.js..." />
        </div>
        <div className="pform__field">
          <label>GitHub URL</label>
          <input value={form.links.github || ''} onChange={e => setLink('github', e.target.value)} placeholder="https://github.com/..." />
        </div>
        <div className="pform__field">
          <label>Live URL</label>
          <input value={form.links.live || ''} onChange={e => setLink('live', e.target.value)} placeholder="https://..." />
        </div>
        <div className="pform__field pform__field--full">
          <label>Accent Color</label>
          <div className="pform__colors">
            {COLORS.map(c => (
              <button key={c} className={`pform__color ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => set('color', c)} />
            ))}
            <input type="color" value={form.color} onChange={e => set('color', e.target.value)} className="pform__color-picker" />
          </div>
        </div>
        <div className="pform__field pform__field--full">
          <label className="pform__checkbox">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
            <span>Show on homepage (featured)</span>
          </label>
        </div>
      </div>
      <div className="pform__actions">
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? '// saving...' : submitLabel}
        </button>
        {onCancel && <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────────────
function AdminDashboard() {
  const { projects, fetchProjects, addProject, updateProject, deleteProject } = useProjectStore()
  const { logout, admin } = useAuthStore()
  const [tab, setTab] = useState('list')
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => { fetchProjects() }, [])

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleAdd = async (data) => {
    setSaving(true)
    try {
      await addProject(data)
      setTab('list')
      notify('Progetto aggiunto!')
    } catch (e) {
      notify(e.message, 'error')
    } finally { setSaving(false) }
  }

  const handleUpdate = async (data) => {
    setSaving(true)
    try {
      await updateProject(editing.id, data)
      setEditing(null)
      notify('Progetto aggiornato!')
    } catch (e) {
      notify(e.message, 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProject(id)
      setConfirmDelete(null)
      notify('Progetto eliminato.')
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  if (editing) {
    return (
      <div className="admin page-enter">
        <div className="container">
          <div className="admin__header">
            <h2>Edit Project</h2>
            <button className="btn btn--ghost" onClick={() => setEditing(null)}>← Back</button>
          </div>
          <ProjectForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} submitLabel="Save Changes" saving={saving} />
        </div>
      </div>
    )
  }

  return (
    <div className="admin page-enter">
      {/* Notification toast */}
      {notification && (
        <div className={`admin__toast ${notification.type === 'error' ? 'admin__toast--error' : ''}`}>
          {notification.msg}
        </div>
      )}

      <div className="container">
        <div className="admin__header">
          <div>
            <div className="section-label mono">// mission_control</div>
            <h1 className="admin__title">Admin Panel</h1>
            {admin && <p className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Connesso come: {admin.username}
            </p>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '2.5rem' }}>
            <button className="btn btn--ghost admin__logout" style={{ fontSize: '0.78rem' }} onClick={() => setShowChangePw(true)}>
              🔑 Cambia password
            </button>
            <button className="btn btn--ghost admin__logout" onClick={logout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className="admin__tabs">
          <button className={`admin__tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
            Projects ({projects.length})
          </button>
          <button className={`admin__tab ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>
            + Add New
          </button>
        </div>

        {tab === 'add' && (
          <ProjectForm onSave={handleAdd} onCancel={() => setTab('list')} saving={saving} />
        )}

        {tab === 'list' && (
          <div className="admin__list">
            {projects.length === 0 && (
              <div className="admin__empty mono">// no projects yet — add one!</div>
            )}
            {projects.map(p => (
              <div key={p.id} className="admin__item glass" style={{ '--accent': p.color }}>
                <div className="admin__item-info">
                  <div className="admin__item-header">
                    <span className="admin__item-dot" />
                    <h3>{p.title}</h3>
                    {p.featured && <span className="tag" style={{ fontSize: '0.65rem' }}>featured</span>}
                  </div>
                  <p className="admin__item-short">{p.short}</p>
                  <div className="admin__item-meta mono">
                    {p.category} · {p.year} · {(p.tech || []).slice(0, 3).join(', ')}
                  </div>
                </div>
                <div className="admin__item-actions">
                  <button className="admin__action-btn" onClick={() => setEditing(p)}>Edit</button>
                  <button className="admin__action-btn admin__action-btn--danger" onClick={() => setConfirmDelete(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal glass" onClick={e => e.stopPropagation()}>
              <h3>Delete project?</h3>
              <p>Questa azione non può essere annullata.</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                <button className="btn btn--primary" style={{ background: 'var(--nova)' }} onClick={() => handleDelete(confirmDelete)}>
                  Elimina
                </button>
                <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>Annulla</button>
              </div>
            </div>
          </div>
        )}

        {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
      </div>
    </div>
  )
}

export default function Admin() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const checkAuth = useAuthStore(s => s.checkAuth)

  useEffect(() => { checkAuth() }, [])

  return isAuthenticated ? <AdminDashboard /> : <LoginGate />
}
