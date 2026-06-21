import { useState, useEffect, useMemo } from 'react'
import { usePaperStore } from '../store'
import PaperCard from '../components/PaperCard'
import './Papers.css'

export default function Papers() {
  const { papers, fetchPapers, loading } = usePaperStore()
  const [tag, setTag] = useState('All')

  useEffect(() => { fetchPapers() }, [])

  const tags = useMemo(() => {
    const set = new Set()
    papers.forEach(p => (p.tags || []).forEach(t => set.add(t)))
    return ['All', ...Array.from(set)]
  }, [papers])

  const filtered = tag === 'All' ? papers : papers.filter(p => (p.tags || []).includes(tag))

  return (
    <div className="papers-page page-enter">
      <div className="container">
        <header className="papers-page__header">
          <div className="section-label mono">// research.papers[]</div>
          <h1 className="papers-page__title">Papers &amp; Research</h1>
          <p className="papers-page__sub">
            {papers.length} publication{papers.length === 1 ? '' : 's'} — read the abstract, download the PDF.
          </p>
        </header>

        {tags.length > 1 && (
          <div className="papers-page__filters">
            {tags.map(t => (
              <button
                key={t}
                className={`filter-btn ${tag === t ? 'active' : ''}`}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="papers-page__empty">
            <span className="mono" style={{ color: 'var(--plasma)', animation: 'pulse 1.5s infinite' }}>
              // loading papers...
            </span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="papers-page__empty">
            <span className="mono">// no papers published yet</span>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="papers-page__grid">
            {filtered.map((p, i) => <PaperCard key={p.id} paper={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
