import { useState, useEffect } from 'react'
import { useProjectStore } from '../store'
import { usePrefs } from '../lib/preferences.jsx'
import ProjectCard from '../components/ProjectCard'
import './Projects.css'

const CATEGORIES = ['All', 'Full Stack', 'Frontend', 'Backend', 'Mobile', 'Other']

export default function Projects() {
  const { projects, fetchProjects, loading } = useProjectStore()
  const { t } = usePrefs()
  const [filter, setFilter] = useState('All')

  useEffect(() => { fetchProjects() }, [])

  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter)
  const categories = new Set(projects.map(p => p.category))

  const categoryLabel = (cat) => (cat === 'All' ? t('common.allProjects') : t(`categories.${cat}`))

  return (
    <div className="projects-page page-enter">
      <div className="container">
        <header className="projects-page__header">
          <div className="section-label mono">{t('projects.label')}</div>
          <h1 className="projects-page__title">{t('projects.title')}</h1>
          <p className="projects-page__sub">
            {t('projects.subtitle')(projects.length, categories.size)}
          </p>
        </header>

        <div className="projects-page__filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {categoryLabel(cat)}
              {cat !== 'All' && (
                <span className="filter-btn__count">
                  {projects.filter(p => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="projects-page__empty">
            <span className="mono" style={{ color: 'var(--plasma)', animation: 'pulse 1.5s infinite' }}>
              {t('projects.loading')}
            </span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="projects-page__empty">
            <span className="mono">{t('projects.empty')}</span>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="projects-page__grid">
            {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
