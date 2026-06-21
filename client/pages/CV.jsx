import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useCvStore } from '../store'
import './CV.css'

const env = {
  name: import.meta.env.VITE_NAME || 'Developer',
  role: import.meta.env.VITE_ROLE || 'Full Stack Developer',
  email: import.meta.env.VITE_EMAIL || '',
  github: import.meta.env.VITE_GITHUB || '',
  linkedin: import.meta.env.VITE_LINKEDIN || '',
  skills: (import.meta.env.VITE_SKILLS || '').split(',').map(s => s.trim()).filter(Boolean),
}

const SECTIONS = [
  { key: 'experience', label: 'Experience', tag: '// work_history' },
  { key: 'education', label: 'Education', tag: '// education' },
]

function Timeline({ entries }) {
  if (entries.length === 0) {
    return <p className="cv__empty mono">// nothing here yet</p>
  }
  return (
    <div className="cv__timeline">
      {entries.map(e => (
        <div key={e.id} className="cv__item">
          <div className="cv__item-dot" />
          <div className="cv__item-body">
            <div className="cv__item-head">
              <h3 className="cv__item-role">{e.role}</h3>
              {e.period && <span className="cv__item-period mono">{e.period}</span>}
            </div>
            <div className="cv__item-org">
              {e.organization}
              {e.location && <span className="cv__item-loc"> · {e.location}</span>}
            </div>
            {e.description && (
              <div className="cv__item-desc detail__markdown">
                <ReactMarkdown>{e.description}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CV() {
  const { entries, file, loading, fetchCv } = useCvStore()

  useEffect(() => { fetchCv() }, [])

  return (
    <div className="cv-page page-enter">
      <div className="container">
        <header className="cv__header">
          <div>
            <div className="section-label mono">// curriculum.vitae</div>
            <h1 className="cv__title">{env.name}</h1>
            <p className="cv__role">{env.role}</p>
            <div className="cv__contacts mono">
              {env.email && <a href={`mailto:${env.email}`} className="cv__contact">{env.email}</a>}
              {env.github && <a href={env.github} target="_blank" rel="noopener" className="cv__contact">GitHub</a>}
              {env.linkedin && <a href={env.linkedin} target="_blank" rel="noopener" className="cv__contact">LinkedIn</a>}
            </div>
          </div>
          {file?.url && (
            <a href={file.url} download={file.name || 'cv.pdf'} className="btn btn--primary cv__download">
              Download CV
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </a>
          )}
        </header>

        {loading && (
          <div className="cv__empty"><span className="mono" style={{ color: 'var(--plasma)', animation: 'pulse 1.5s infinite' }}>// loading...</span></div>
        )}

        {!loading && (
          <div className="cv__sections">
            {SECTIONS.map(s => {
              const items = entries.filter(e => e.section === s.key)
              return (
                <section key={s.key} className="cv__section">
                  <h2 className="cv__section-title mono">{s.tag}</h2>
                  <Timeline entries={items} />
                </section>
              )
            })}

            {env.skills.length > 0 && (
              <section className="cv__section">
                <h2 className="cv__section-title mono">// skills</h2>
                <div className="cv__skills">
                  {env.skills.map(skill => (
                    <span key={skill} className="cv__skill">{skill}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
