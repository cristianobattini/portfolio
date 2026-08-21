import { useState, useEffect, useMemo } from 'react'
import { usePaperStore } from '../store'
import { usePrefs } from '../lib/preferences.jsx'
import PaperCard from '../components/PaperCard'
import './Papers.css'

export default function Papers() {
  const { papers, fetchPapers, loading } = usePaperStore()
  const { t } = usePrefs()
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
          <div className="section-label mono">{t('works.label')}</div>
          <h1 className="papers-page__title">{t('works.title')}</h1>
          <p className="papers-page__sub">
            {t('works.subtitle')(papers.length)}
          </p>
        </header>

        {tags.length > 1 && (
          <div className="papers-page__filters">
            {tags.map(tg => (
              <button
                key={tg}
                className={`filter-btn ${tag === tg ? 'active' : ''}`}
                onClick={() => setTag(tg)}
              >
                {tg === 'All' ? t('common.allProjects') : tg}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="papers-page__empty">
            <span className="mono" style={{ color: 'var(--plasma)', animation: 'pulse 1.5s infinite' }}>
              {t('works.loading')}
            </span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="papers-page__empty">
            <span className="mono">{t('works.empty')}</span>
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
