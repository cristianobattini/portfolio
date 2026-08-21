import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { papersApi } from '../api'
import { usePaperStore } from '../store'
import { usePrefs } from '../lib/preferences.jsx'
import './PaperDetail.css'

export default function PaperDetail() {
  const { id } = useParams()
  const getPaper = usePaperStore(s => s.getPaper)
  const papers = usePaperStore(s => s.papers)
  const fetchPapers = usePaperStore(s => s.fetchPapers)

  const { t } = usePrefs()
  const [paper, setPaper] = useState(() => getPaper(id))
  const [loading, setLoading] = useState(!paper)

  useEffect(() => {
    if (!paper) {
      setLoading(true)
      papersApi.getOne(id)
        .then(setPaper)
        .catch(() => setPaper(null))
        .finally(() => setLoading(false))
    }
    if (papers.length === 0) fetchPapers()
  }, [id])

  if (loading) {
    return (
      <div className="paper-detail page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="mono" style={{ color: 'var(--plasma)', animation: 'pulse 1.5s infinite' }}>{t('common.loading')}</span>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="paper-detail page-enter">
        <div className="container" style={{ paddingTop: 'calc(var(--nav-h) + 6rem)' }}>
          <span className="mono" style={{ color: 'var(--nova)' }}>{t('workDetail.status404')}</span>
          <h1 style={{ margin: '1rem 0 2rem' }}>{t('workDetail.lost')}</h1>
          <Link to="/papers" className="btn btn--outline">← {t('common.backToWorks')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="paper-detail page-enter">
      <div className="container">
        <Link to="/papers" className="paper-detail__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="mono">{t('common.backToWorks')}</span>
        </Link>

        <div className="paper-detail__meta">
          {paper.venue && <span className="tag" style={{ color: 'var(--aurora)', borderColor: 'var(--aurora-dim)' }}>{paper.venue}</span>}
          <span className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{paper.year}</span>
        </div>

        <h1 className="paper-detail__title">{paper.title}</h1>
        {paper.authors && <p className="paper-detail__authors">{paper.authors}</p>}

        <div className="paper-detail__actions">
          {paper.fileUrl && (
            <>
              <a href={paper.fileUrl} target="_blank" rel="noopener" className="btn btn--primary" style={{ background: 'var(--aurora)', color: 'var(--text-bright)', boxShadow: '0 0 30px rgba(217,98,43,0.3)' }}>
                {t('workDetail.readPdf')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </a>
              <a href={paper.fileUrl} download={paper.file_name || 'paper.pdf'} className="btn btn--ghost">
                {t('workDetail.download')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </a>
            </>
          )}
          {paper.link && (
            <a href={paper.link} target="_blank" rel="noopener" className="btn btn--ghost">{t('common.externalLink')}</a>
          )}
        </div>

        {paper.tags?.length > 0 && (
          <div className="paper-detail__tags">
            {paper.tags.map(t => <span key={t} className="paper-detail__tag mono">{t}</span>)}
          </div>
        )}

        <div className="paper-detail__divider" />

        {paper.abstract && (
          <div className="paper-detail__abstract">
            <h2 className="paper-detail__section-title mono">{t('workDetail.abstract')}</h2>
            <div className="detail__markdown">
              <ReactMarkdown>{paper.abstract}</ReactMarkdown>
            </div>
          </div>
        )}

        {paper.fileUrl && (
          <div className="paper-detail__viewer">
            <h2 className="paper-detail__section-title mono">{t('workDetail.preview')}</h2>
            <object data={paper.fileUrl} type="application/pdf" className="paper-detail__pdf">
              <p className="mono" style={{ color: 'var(--text-dim)', padding: '2rem' }}>
                {t('workDetail.pdfFallback')}{' '}
                <a href={paper.fileUrl} target="_blank" rel="noopener" style={{ color: 'var(--plasma)' }}>{t('common.openInNewTab')}</a>
              </p>
            </object>
          </div>
        )}
      </div>
    </div>
  )
}
