import { Link } from 'react-router-dom'
import './ProjectCard.css'

export default function ProjectCard({ project, index }) {
  return (
    <Link to={`/projects/${project.id}`} className="pcard" style={{ '--accent': project.color }}>
      <div className="pcard__index mono">{String(index + 1).padStart(2, '0')}</div>
      
      <div className="pcard__glow" />
      
      <div className="pcard__header">
        <div className="pcard__meta">
          <span className="tag">{project.category}</span>
          {project.status && <span className="tag pcard__status">{project.status}</span>}
        </div>
        <span className="pcard__year mono">{project.year}</span>
      </div>

      <h3 className="pcard__title">{project.title}</h3>
      <p className="pcard__short">{project.short}</p>

      <div className="pcard__tech">
        {project.tech.slice(0, 4).map(t => (
          <span key={t} className="pcard__tech-item mono">{t}</span>
        ))}
        {project.tech.length > 4 && <span className="pcard__tech-item mono">+{project.tech.length - 4}</span>}
      </div>

      <div className="pcard__arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 17L17 7M17 7H7M17 7v10"/>
        </svg>
      </div>
    </Link>
  )
}
