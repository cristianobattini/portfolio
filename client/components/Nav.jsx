import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePrefs } from '../lib/preferences.jsx'
import './Nav.css'

const env = {
  name: import.meta.env.VITE_NAME || 'Developer',
}

function PrefsSwitcher() {
  const { lang, toggleLang, theme, toggleTheme, t } = usePrefs()
  return (
    <div className="nav__prefs">
      <button
        className="nav__prefs-btn nav__prefs-btn--lang"
        onClick={toggleLang}
        title={t('prefs.lang')}
        aria-label={t('prefs.lang')}
      >
        <span className={lang === 'it' ? 'active' : ''}>IT</span>
        <span className="nav__prefs-sep">/</span>
        <span className={lang === 'en' ? 'active' : ''}>EN</span>
      </button>
      <button
        className="nav__prefs-btn nav__prefs-btn--theme"
        onClick={toggleTheme}
        title={t('prefs.theme')}
        aria-label={t('prefs.theme')}
      >
        {theme === 'dark' ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        )}
      </button>
    </div>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { t } = usePrefs()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const initials = env.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__logo">
          <span className="nav__logo-mark">{initials}</span>
          <span className="nav__logo-dot" />
        </Link>

        <div className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
          <Link to="/" className={`nav__link ${location.pathname === '/' ? 'active' : ''}`}>
            <span className="mono">01.</span> {t('nav.home')}
          </Link>
          <Link to="/projects" className={`nav__link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}>
            <span className="mono">02.</span> {t('nav.projects')}
          </Link>
          <Link to="/papers" className={`nav__link ${location.pathname.startsWith('/papers') ? 'active' : ''}`}>
            <span className="mono">03.</span> {t('nav.works')}
          </Link>
          <Link to="/cv" className={`nav__link ${location.pathname.startsWith('/cv') ? 'active' : ''}`}>
            <span className="mono">04.</span> {t('nav.cv')}
          </Link>
          <Link to="/admin" className="nav__link nav__link--admin">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {t('nav.admin')}
          </Link>
        </div>

        <div className="nav__right">
          <PrefsSwitcher />
          <button className={`nav__burger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </nav>
  )
}
