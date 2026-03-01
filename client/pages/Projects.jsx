import { useState, useEffect } from 'react'
import { useProjectStore } from '../store'
import ProjectCard from '../components/ProjectCard'
import './Projects.css'

const CATEGORIES = ['All', 'Full Stack', 'Frontend', 'Backend', 'Mobile', 'Other']

export default function Projects() {
  const { projects, fetchProjects, loading } = useProjectStore()
  const [filter, setFilter] = useState('All')

  useEffect(() => { fetchProjects() }, [])

  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter)
  const categories = new Set(projects.map(p => p.category))

  return (
    <div className="projects-page page-enter">
      <div className="container">
        <header className="projects-page__header">
          <div className="section-label mono">// projects[]</div>
          <h1 className="projects-page__title">All Projects</h1>
          <p className="projects-page__sub">
            {projects.length} projects across {categories.size} domains
          </p>
        </header>

        <div className="projects-page__filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
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
              // loading projects...
            </span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="projects-page__empty">
            <span className="mono">// no projects found in this category</span>
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
