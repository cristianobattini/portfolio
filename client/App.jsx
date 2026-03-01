import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Nav from './components/Nav'
import Cursor from './components/Cursor'
import SpaceBackground from './components/SpaceBackground'

const Home = lazy(() => import('./pages/Home'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Admin = lazy(() => import('./pages/Admin'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppContent() {
  return (
    <>
      <SpaceBackground />
      <Cursor />
      <Nav />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Suspense fallback={
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="mono" style={{ color: 'var(--plasma)', fontSize: '0.8rem', letterSpacing: '0.2em', animation: 'pulse 1.5s infinite' }}>
              // loading...
            </span>
          </div>
        }>
          <ScrollTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
