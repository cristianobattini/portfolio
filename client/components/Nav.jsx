import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Nav.css'

const env = {
  name: import.meta.env.VITE_NAME || 'Developer',
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

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
            <span className="mono">01.</span> Home
          </Link>
          <Link to="/projects" className={`nav__link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}>
            <span className="mono">02.</span> Projects
          </Link>
          <Link to="/admin" className="nav__link nav__link--admin">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Admin
          </Link>
        </div>

        <button className={`nav__burger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span/><span/><span/>
        </button>
      </div>
    </nav>
  )
}
