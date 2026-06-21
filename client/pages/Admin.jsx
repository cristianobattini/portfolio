import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useProjectStore, usePaperStore, useCvStore, useAuthStore } from '../store'
import { authApi, papersApi, cvApi } from '../api'
import './Admin.css'

const CATEGORIES = ['Full Stack', 'Frontend', 'Backend', 'Mobile', 'Other']
const COLORS = ['#00f5ff', '#7b2fff', '#ff2d78', '#ffd60a', '#22d55e', '#ff6b35']

// ── Login Gate (Supabase email/password) ──────────────────────────
function LoginGate() {
  const { login, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)

  const handleSubmit = async () => {
    const ok = await login(email, password)
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
        <p className="login__sub">Restricted area. Supabase authentication required.</p>

        <div className={`login__field ${error ? 'login__field--error' : ''}`}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => { setEmail(e.target.value); clearError() }}
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

// ── Change Password Modal (Supabase updateUser) ───────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ next: '', confirm: '' })
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setErr(null)
    if (form.next !== form.confirm) return setErr('Le nuove password non coincidono.')
    if (form.next.length < 8) return setErr('Minimo 8 caratteri.')
    setLoading(true)
    try {
      await authApi.changePassword(form.next)
      setMsg('Password aggiornata con successo.')
      setTimeout(onClose, 1800)
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
        <p style={{ marginBottom: '1.5rem' }}>La password viene aggiornata tramite Supabase Auth.</p>

        {['next', 'confirm'].map((field, i) => (
          <div key={field} className="pform__field" style={{ marginBottom: '1rem' }}>
            <label>{['Nuova password', 'Conferma nuova password'][i]}</label>
            <input
              type="password"
              value={form[field]}
              onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
              placeholder="Minimo 8 caratteri"
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
const emptyProject = {
  title: '', short: '', description: '', category: 'Full Stack',
  tech: '', year: new Date().getFullYear().toString(), status: 'Live',
  color: '#00f5ff', featured: false,
  links: { github: '', live: '' },
}

function ProjectForm({ initial = emptyProject, onSave, onCancel, submitLabel = 'Launch Project', saving }) {
  const [form, setForm] = useState({
    ...initial,
    tech: Array.isArray(initial.tech) ? initial.tech.join(', ') : initial.tech,
  })
  const [descTab, setDescTab] = useState('write')

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
          <div className="pform__desc-header">
            <label>Full Description</label>
            <div className="pform__desc-tabs">
              <button type="button" className={`pform__desc-tab ${descTab === 'write' ? 'active' : ''}`} onClick={() => setDescTab('write')}>Write</button>
              <button type="button" className={`pform__desc-tab ${descTab === 'preview' ? 'active' : ''}`} onClick={() => setDescTab('preview')}>Preview</button>
            </div>
          </div>
          {descTab === 'write' ? (
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={8} placeholder="Supports **markdown**: headings, lists, `code`, links..." />
          ) : (
            <div className="pform__desc-preview detail__markdown">
              {form.description ? <ReactMarkdown>{form.description}</ReactMarkdown> : <span className="pform__desc-empty">Nothing to preview yet.</span>}
            </div>
          )}
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

// ── Paper Form ────────────────────────────────────────────────────
const emptyPaper = {
  title: '', authors: '', abstract: '', venue: '',
  year: new Date().getFullYear().toString(), tags: '', link: '',
  featured: false, file_path: '', file_name: '',
}

function PaperForm({ initial = emptyPaper, onSave, onCancel, submitLabel = 'Publish Paper', saving }) {
  const [form, setForm] = useState({
    ...initial,
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
  })
  const [file, setFile] = useState(null)
  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({
      ...form,
      tags: typeof form.tags === 'string'
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : form.tags,
    }, file)
  }

  return (
    <div className="pform glass">
      <div className="pform__grid">
        <div className="pform__field pform__field--full">
          <label>Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Towards Faster Inference..." />
        </div>
        <div className="pform__field pform__field--full">
          <label>Authors</label>
          <input value={form.authors} onChange={e => set('authors', e.target.value)} placeholder="A. Smith, B. Jones, C. Doe" />
        </div>
        <div className="pform__field">
          <label>Venue / Journal</label>
          <input value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="NeurIPS 2024 / arXiv" />
        </div>
        <div className="pform__field">
          <label>Year</label>
          <input value={form.year} onChange={e => set('year', e.target.value)} placeholder="2024" />
        </div>
        <div className="pform__field pform__field--full">
          <label>Abstract (markdown supported)</label>
          <textarea value={form.abstract} onChange={e => set('abstract', e.target.value)} rows={6} placeholder="Short summary of the paper..." />
        </div>
        <div className="pform__field pform__field--full">
          <label>Tags (comma separated)</label>
          <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="machine learning, NLP, optimization" />
        </div>
        <div className="pform__field pform__field--full">
          <label>External link (DOI / arXiv, optional)</label>
          <input value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://arxiv.org/abs/..." />
        </div>
        <div className="pform__field pform__field--full">
          <label>PDF file {form.file_name && <span className="mono" style={{ color: 'var(--text-dim)' }}>— current: {form.file_name}</span>}</label>
          <input type="file" accept="application/pdf" className="pform__file" onChange={e => setFile(e.target.files?.[0] || null)} />
          {file && <span className="mono" style={{ color: 'var(--plasma)', fontSize: '0.72rem', marginTop: '0.4rem' }}>↑ {file.name} ready to upload</span>}
        </div>
        <div className="pform__field pform__field--full">
          <label className="pform__checkbox">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
            <span>Highlight on homepage (featured)</span>
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

// ── CV Entry Form ─────────────────────────────────────────────────
const emptyEntry = {
  section: 'experience', role: '', organization: '',
  location: '', period: '', description: '', sort_order: 0,
}

function CvEntryForm({ initial = emptyEntry, onSave, onCancel, submitLabel = 'Add Entry', saving }) {
  const [form, setForm] = useState(initial)
  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const handleSave = () => {
    if (!form.role.trim()) return
    onSave(form)
  }

  return (
    <div className="pform glass">
      <div className="pform__grid">
        <div className="pform__field">
          <label>Section</label>
          <select value={form.section} onChange={e => set('section', e.target.value)}>
            <option value="experience">Experience</option>
            <option value="education">Education</option>
          </select>
        </div>
        <div className="pform__field">
          <label>Period</label>
          <input value={form.period} onChange={e => set('period', e.target.value)} placeholder="2022 — Present" />
        </div>
        <div className="pform__field pform__field--full">
          <label>Role / Title *</label>
          <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="Software Engineer" />
        </div>
        <div className="pform__field">
          <label>Organization</label>
          <input value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Company / University" />
        </div>
        <div className="pform__field">
          <label>Location</label>
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Rome, Italy" />
        </div>
        <div className="pform__field pform__field--full">
          <label>Description (markdown supported)</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} placeholder="What you did, achievements..." />
        </div>
        <div className="pform__field">
          <label>Sort order (higher = first)</label>
          <input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} placeholder="0" />
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

// ── CV Manager ────────────────────────────────────────────────────
function CvManager({ notify }) {
  const { entries, file, fetchCv, addEntry, updateEntry, deleteEntry, setFile } = useCvStore()
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { fetchCv() }, [])

  const handleUploadCv = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    try {
      const updated = await cvApi.uploadFile(f, file?.path)
      setFile(updated)
      notify('CV caricato!')
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveCv = async () => {
    try {
      await cvApi.removeFile(file?.path)
      setFile(null)
      notify('CV rimosso.')
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  const handleAdd = async (data) => {
    setSaving(true)
    try { await addEntry(data); setAdding(false); notify('Voce aggiunta!') }
    catch (e) { notify(e.message, 'error') } finally { setSaving(false) }
  }

  const handleUpdate = async (data) => {
    setSaving(true)
    try { await updateEntry(editing.id, data); setEditing(null); notify('Voce aggiornata!') }
    catch (e) { notify(e.message, 'error') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteEntry(id); setConfirmDelete(null); notify('Voce eliminata.') }
    catch (e) { notify(e.message, 'error') }
  }

  if (editing) {
    return (
      <>
        <div className="admin__subhead"><h3>Edit CV entry</h3><button className="btn btn--ghost" onClick={() => setEditing(null)}>← Back</button></div>
        <CvEntryForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} submitLabel="Save Changes" saving={saving} />
      </>
    )
  }

  const sections = [['experience', 'Experience'], ['education', 'Education']]

  return (
    <div className="cv-manager">
      {/* CV file uploader */}
      <div className="admin__item glass" style={{ '--accent': 'var(--plasma)' }}>
        <div className="admin__item-info">
          <div className="admin__item-header">
            <span className="admin__item-dot" />
            <h3>CV document (PDF)</h3>
          </div>
          <p className="admin__item-short">
            {file?.name ? <>Current file: <strong>{file.name}</strong></> : 'No CV uploaded yet. Visitors will only see the timeline below.'}
          </p>
          {file?.url && <a href={file.url} target="_blank" rel="noopener" className="mono" style={{ color: 'var(--plasma)', fontSize: '0.75rem' }}>open current PDF →</a>}
        </div>
        <div className="admin__item-actions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <label className="admin__action-btn" style={{ textAlign: 'center', cursor: 'none' }}>
            {uploading ? '// uploading...' : (file ? 'Replace PDF' : 'Upload PDF')}
            <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleUploadCv} disabled={uploading} />
          </label>
          {file && <button className="admin__action-btn admin__action-btn--danger" onClick={handleRemoveCv}>Remove</button>}
        </div>
      </div>

      <div className="admin__subhead" style={{ marginTop: '2rem' }}>
        <h3>Timeline entries ({entries.length})</h3>
        {!adding && <button className="btn btn--ghost" onClick={() => setAdding(true)}>+ Add entry</button>}
      </div>

      {adding && <CvEntryForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />}

      {sections.map(([key, label]) => {
        const items = entries.filter(e => e.section === key)
        if (items.length === 0) return null
        return (
          <div key={key} style={{ marginTop: '1.5rem' }}>
            <div className="section-label mono" style={{ marginBottom: '1rem' }}>// {label.toLowerCase()}</div>
            <div className="admin__list">
              {items.map(e => (
                <div key={e.id} className="admin__item glass" style={{ '--accent': 'var(--aurora)' }}>
                  <div className="admin__item-info">
                    <div className="admin__item-header">
                      <span className="admin__item-dot" />
                      <h3>{e.role}</h3>
                    </div>
                    <p className="admin__item-short">{e.organization}{e.location && ` · ${e.location}`}</p>
                    <div className="admin__item-meta mono">{e.period || '—'}</div>
                  </div>
                  <div className="admin__item-actions">
                    <button className="admin__action-btn" onClick={() => setEditing(e)}>Edit</button>
                    <button className="admin__action-btn admin__action-btn--danger" onClick={() => setConfirmDelete(e.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {entries.length === 0 && !adding && (
        <div className="admin__empty mono">// no timeline entries yet — add experience or education</div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal glass" onClick={ev => ev.stopPropagation()}>
            <h3>Delete entry?</h3>
            <p>Questa azione non può essere annullata.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
              <button className="btn btn--primary" style={{ background: 'var(--nova)' }} onClick={() => handleDelete(confirmDelete)}>Elimina</button>
              <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────────────
function AdminDashboard() {
  const { projects, fetchProjects, addProject, updateProject, deleteProject } = useProjectStore()
  const { papers, fetchPapers, addPaper, updatePaper, deletePaper } = usePaperStore()
  const { logout, user } = useAuthStore()
  const [tab, setTab] = useState('projects')
  const [editingProject, setEditingProject] = useState(null)
  const [editingPaper, setEditingPaper] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)   // { type, payload }
  const [saving, setSaving] = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => { fetchProjects(); fetchPapers() }, [])

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Projects
  const handleAddProject = async (data) => {
    setSaving(true)
    try { await addProject(data); setTab('projects'); notify('Progetto aggiunto!') }
    catch (e) { notify(e.message, 'error') } finally { setSaving(false) }
  }
  const handleUpdateProject = async (data) => {
    setSaving(true)
    try { await updateProject(editingProject.id, data); setEditingProject(null); notify('Progetto aggiornato!') }
    catch (e) { notify(e.message, 'error') } finally { setSaving(false) }
  }

  // Papers (with file upload)
  const handleAddPaper = async (data, fileObj) => {
    setSaving(true)
    try {
      let { file_path, file_name } = data
      if (fileObj) { const up = await papersApi.uploadFile(fileObj); file_path = up.path; file_name = up.name }
      await addPaper({ ...data, file_path, file_name })
      setTab('papers'); notify('Paper pubblicato!')
    } catch (e) { notify(e.message, 'error') } finally { setSaving(false) }
  }
  const handleUpdatePaper = async (data, fileObj) => {
    setSaving(true)
    try {
      let { file_path, file_name } = data
      if (fileObj) { const up = await papersApi.uploadFile(fileObj, editingPaper.file_path); file_path = up.path; file_name = up.name }
      await updatePaper(editingPaper.id, { ...data, file_path, file_name })
      setEditingPaper(null); notify('Paper aggiornato!')
    } catch (e) { notify(e.message, 'error') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      if (confirmDelete.type === 'project') await deleteProject(confirmDelete.payload)
      else if (confirmDelete.type === 'paper') await deletePaper(confirmDelete.payload)
      setConfirmDelete(null); notify('Eliminato.')
    } catch (e) { notify(e.message, 'error') }
  }

  // Edit screens
  if (editingProject) {
    return (
      <div className="admin page-enter"><div className="container">
        <div className="admin__header"><h2>Edit Project</h2><button className="btn btn--ghost" onClick={() => setEditingProject(null)}>← Back</button></div>
        <ProjectForm initial={editingProject} onSave={handleUpdateProject} onCancel={() => setEditingProject(null)} submitLabel="Save Changes" saving={saving} />
      </div></div>
    )
  }
  if (editingPaper) {
    return (
      <div className="admin page-enter"><div className="container">
        <div className="admin__header"><h2>Edit Paper</h2><button className="btn btn--ghost" onClick={() => setEditingPaper(null)}>← Back</button></div>
        <PaperForm initial={editingPaper} onSave={handleUpdatePaper} onCancel={() => setEditingPaper(null)} submitLabel="Save Changes" saving={saving} />
      </div></div>
    )
  }

  return (
    <div className="admin page-enter">
      {notification && (
        <div className={`admin__toast ${notification.type === 'error' ? 'admin__toast--error' : ''}`}>{notification.msg}</div>
      )}

      <div className="container">
        <div className="admin__header">
          <div>
            <div className="section-label mono">// mission_control</div>
            <h1 className="admin__title">Admin Panel</h1>
            {user && <p className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Connesso come: {user.email}
            </p>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn--ghost admin__logout" style={{ fontSize: '0.78rem' }} onClick={() => setShowChangePw(true)}>🔑 Cambia password</button>
            <button className="btn btn--ghost admin__logout" onClick={logout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className="admin__tabs">
          <button className={`admin__tab ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>Projects ({projects.length})</button>
          <button className={`admin__tab ${tab === 'addProject' ? 'active' : ''}`} onClick={() => setTab('addProject')}>+ Project</button>
          <button className={`admin__tab ${tab === 'papers' ? 'active' : ''}`} onClick={() => setTab('papers')}>Papers ({papers.length})</button>
          <button className={`admin__tab ${tab === 'addPaper' ? 'active' : ''}`} onClick={() => setTab('addPaper')}>+ Paper</button>
          <button className={`admin__tab ${tab === 'cv' ? 'active' : ''}`} onClick={() => setTab('cv')}>CV</button>
        </div>

        {tab === 'addProject' && <ProjectForm onSave={handleAddProject} onCancel={() => setTab('projects')} saving={saving} />}
        {tab === 'addPaper' && <PaperForm onSave={handleAddPaper} onCancel={() => setTab('papers')} saving={saving} />}
        {tab === 'cv' && <CvManager notify={notify} />}

        {tab === 'projects' && (
          <div className="admin__list">
            {projects.length === 0 && <div className="admin__empty mono">// no projects yet — add one!</div>}
            {projects.map(p => (
              <div key={p.id} className="admin__item glass" style={{ '--accent': p.color }}>
                <div className="admin__item-info">
                  <div className="admin__item-header">
                    <span className="admin__item-dot" />
                    <h3>{p.title}</h3>
                    {p.featured && <span className="tag" style={{ fontSize: '0.65rem' }}>featured</span>}
                  </div>
                  <p className="admin__item-short">{p.short}</p>
                  <div className="admin__item-meta mono">{p.category} · {p.year} · {(p.tech || []).slice(0, 3).join(', ')}</div>
                </div>
                <div className="admin__item-actions">
                  <button className="admin__action-btn" onClick={() => setEditingProject(p)}>Edit</button>
                  <button className="admin__action-btn admin__action-btn--danger" onClick={() => setConfirmDelete({ type: 'project', payload: p.id })}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'papers' && (
          <div className="admin__list">
            {papers.length === 0 && <div className="admin__empty mono">// no papers yet — add one!</div>}
            {papers.map(p => (
              <div key={p.id} className="admin__item glass" style={{ '--accent': 'var(--aurora)' }}>
                <div className="admin__item-info">
                  <div className="admin__item-header">
                    <span className="admin__item-dot" />
                    <h3>{p.title}</h3>
                    {p.featured && <span className="tag" style={{ fontSize: '0.65rem' }}>featured</span>}
                    {p.file_path && <span className="tag" style={{ fontSize: '0.65rem', color: 'var(--plasma)' }}>PDF</span>}
                  </div>
                  <p className="admin__item-short">{p.authors}</p>
                  <div className="admin__item-meta mono">{p.venue || '—'} · {p.year} · {(p.tags || []).slice(0, 3).join(', ')}</div>
                </div>
                <div className="admin__item-actions">
                  <button className="admin__action-btn" onClick={() => setEditingPaper(p)}>Edit</button>
                  <button className="admin__action-btn admin__action-btn--danger" onClick={() => setConfirmDelete({ type: 'paper', payload: p })}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal glass" onClick={e => e.stopPropagation()}>
              <h3>Delete {confirmDelete.type}?</h3>
              <p>Questa azione non può essere annullata{confirmDelete.type === 'paper' ? ' (anche il PDF verrà rimosso)' : ''}.</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                <button className="btn btn--primary" style={{ background: 'var(--nova)' }} onClick={handleDelete}>Elimina</button>
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
  const { isAuthenticated, ready, init } = useAuthStore()

  useEffect(() => { init() }, [])

  if (!ready) {
    return (
      <div className="admin page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="mono" style={{ color: 'var(--plasma)', animation: 'pulse 1.5s infinite' }}>// checking session...</span>
      </div>
    )
  }

  return isAuthenticated ? <AdminDashboard /> : <LoginGate />
}
