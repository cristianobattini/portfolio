import { useParams, Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import { projectsApi } from '../api'
import { useProjectStore } from '../store'
import './ProjectDetail.css'

function RotatingGeo({ color }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.4
    ref.current.rotation.y = state.clock.elapsedTime * 0.6
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.5, 1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} wireframe />
    </mesh>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const getProject = useProjectStore(s => s.getProject)
  const projects = useProjectStore(s => s.projects)
  const fetchProjects = useProjectStore(s => s.fetchProjects)

  const [project, setProject] = useState(() => getProject(id))
  const [loading, setLoading] = useState(!project)

  useEffect(() => {
    if (!project) {
      setLoading(true)
      projectsApi.getOne(id)
        .then(setProject)
        .catch(() => setProject(null))
        .finally(() => setLoading(false))
    }
    // Ensure all projects are loaded for prev/next navigation
    if (projects.length === 0) fetchProjects()
  }, [id])

  if (loading) {
    return (
      <div className="detail page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="mono" style={{ color: 'var(--plasma)', animation: 'pulse 1.5s infinite' }}>// loading...</span>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="detail-notfound page-enter">
        <div className="container">
          <span className="mono" style={{ color: 'var(--nova)' }}>// 404: project not found</span>
          <h1>Lost in space</h1>
          <Link to="/projects" className="btn btn--outline">← Back to projects</Link>
        </div>
      </div>
    )
  }

  const idx = projects.findIndex(p => String(p.id) === String(id))
  const prev = projects[idx + 1]
  const next = projects[idx - 1]

  return (
    <div className="detail page-enter">
      <div className="container">
        <Link to="/projects" className="detail__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="mono">All projects</span>
        </Link>

        <div className="detail__hero">
          <div className="detail__hero-content">
            <div className="detail__meta">
              <span className="tag" style={{ color: project.color, borderColor: `color-mix(in srgb, ${project.color} 30%, transparent)` }}>
                {project.category}
              </span>
              <span className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{project.year}</span>
              {project.status && <span className="detail__status">{project.status}</span>}
            </div>

            <h1 className="detail__title" style={{ '--accent': project.color }}>{project.title}</h1>
            <p className="detail__short">{project.short}</p>

            <div className="detail__links">
              {project.links?.live && (
                <a href={project.links.live} target="_blank" rel="noopener" className="btn btn--primary" style={{ background: project.color }}>
                  View Live
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10"/>
                  </svg>
                </a>
              )}
              {project.links?.github && (
                <a href={project.links.github} target="_blank" rel="noopener" className="btn btn--ghost">GitHub →</a>
              )}
            </div>
          </div>

          <div className="detail__visual">
            <div className="detail__canvas-wrap" style={{ '--accent': project.color }}>
              <Canvas camera={{ position: [0, 0, 5] }} style={{ background: 'transparent' }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} color={project.color} intensity={2} />
                <pointLight position={[-5, -5, -5]} color="#7b2fff" intensity={1} />
                <RotatingGeo color={project.color} />
              </Canvas>
            </div>
          </div>
        </div>

        <div className="detail__divider" />

        <div className="detail__body">
          <div className="detail__description">
            <h2 className="detail__section-title">About this project</h2>
            <p className="detail__text">{project.description}</p>
          </div>

          <div className="detail__sidebar">
            <div className="detail__info-block">
              <h3 className="detail__info-label mono">// tech_stack</h3>
              <div className="detail__tech">
                {(project.tech || []).map(t => (
                  <span key={t} className="detail__tech-item">{t}</span>
                ))}
              </div>
            </div>
            <div className="detail__info-block">
              <h3 className="detail__info-label mono">// metadata</h3>
              <dl className="detail__dl">
                <dt>Year</dt><dd>{project.year}</dd>
                <dt>Category</dt><dd>{project.category}</dd>
                <dt>Status</dt><dd style={{ color: project.color }}>{project.status || 'N/A'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="detail__divider" />

        <nav className="detail__nav">
          {prev ? (
            <Link to={`/projects/${prev.id}`} className="detail__nav-item detail__nav-item--prev">
              <span className="mono">← previous</span>
              <strong>{prev.title}</strong>
            </Link>
          ) : <div />}
          {next ? (
            <Link to={`/projects/${next.id}`} className="detail__nav-item detail__nav-item--next">
              <span className="mono">next →</span>
              <strong>{next.title}</strong>
            </Link>
          ) : <div />}
        </nav>
      </div>
    </div>
  )
}
