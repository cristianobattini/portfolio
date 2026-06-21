import { Link } from 'react-router-dom'
import './PaperCard.css'

export default function PaperCard({ paper, index }) {
  return (
    <Link to={`/papers/${paper.id}`} className="paper-card glass">
      <div className="paper-card__top">
        <span className="paper-card__index mono">{String(index + 1).padStart(2, '0')}</span>
        <div className="paper-card__badges">
          {paper.venue && <span className="tag paper-card__venue">{paper.venue}</span>}
          <span className="paper-card__year mono">{paper.year}</span>
        </div>
      </div>

      <h3 className="paper-card__title">{paper.title}</h3>
      {paper.authors && <p className="paper-card__authors">{paper.authors}</p>}
      {paper.abstract && <p className="paper-card__abstract">{paper.abstract}</p>}

      {paper.tags?.length > 0 && (
        <div className="paper-card__tags">
          {paper.tags.slice(0, 4).map(t => (
            <span key={t} className="paper-card__tag mono">{t}</span>
          ))}
        </div>
      )}

      <div className="paper-card__footer">
        {paper.fileUrl ? (
          <span className="paper-card__action">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
            </svg>
            PDF
          </span>
        ) : <span className="paper-card__action paper-card__action--muted mono">no file</span>}
        <span className="paper-card__arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </span>
      </div>
    </Link>
  )
}
