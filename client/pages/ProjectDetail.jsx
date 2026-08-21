import { useParams, Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import ReactMarkdown from 'react-markdown'
import { projectsApi } from '../api'
import { useProjectStore } from '../store'
import { usePrefs } from '../lib/preferences.jsx'
import './ProjectDetail.css'

// Default visual for projects without a logo — a slowly tumbling wireframe gem.
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

// A project's logo, mounted like a framed plaque — a beveled 3D backing
// in the project's accent color (lit by the scene, so it actually catches
// the point lights) sized to the image's real aspect ratio, with the logo
// inset on top and a soft glow behind. Idles with a gentle float and leans
// toward the cursor. Falls back to RotatingGeo while loading or on error.
function LogoPlate({ url, color }) {
  const [texture, setTexture] = useState(null)
  const [aspect, setAspect] = useState(1)
  const [failed, setFailed] = useState(false)
  const group = useRef()

  useEffect(() => {
    let cancelled = false
    setTexture(null)
    setFailed(false)
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      url,
      (tex) => {
        if (cancelled) return
        tex.colorSpace = THREE.SRGBColorSpace
        const img = tex.image
        if (img?.width && img?.height) setAspect(img.width / img.height)
        setTexture(tex)
      },
      undefined,
      () => { if (!cancelled) setFailed(true) }
    )
    return () => { cancelled = true }
  }, [url])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const tiltX = state.pointer.y * 0.25
    const tiltY = state.pointer.x * 0.3
    group.current.rotation.y = Math.sin(t * 0.4) * 0.2 + tiltY
    group.current.rotation.x = Math.sin(t * 0.3) * 0.05 - tiltX
    group.current.position.y = Math.sin(t * 0.8) * 0.1
  })

  if (failed) return <RotatingGeo color={color} />
  if (!texture) return null

  const maxSize = 2.1
  const w = aspect >= 1 ? maxSize : maxSize * aspect
  const h = aspect >= 1 ? maxSize / aspect : maxSize

  return (
    <group ref={group}>
      {/* ambient glow behind the whole plaque */}
      <mesh position={[0, 0, -0.4]}>
        <circleGeometry args={[Math.max(w, h) * 0.95, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* beveled backing plate — a real 3D object, catches the scene's lights */}
      <RoundedBox args={[w + 0.3, h + 0.3, 0.14]} radius={0.09} smoothness={4} position={[0, 0, -0.1]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.22} metalness={0.25} roughness={0.55} />
      </RoundedBox>
      {/* the logo image, inset on the front face */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

// Fallback visual for Mobile projects with no logo: a stylized 3D phone —
// a beveled body, a glowing "screen" in the project's accent color, a
// camera dot and a home indicator. Idles with a float and leans with the
// cursor, same language as LogoPlate.
function StylizedPhone({ color }) {
  const group = useRef()
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const tiltX = state.pointer.y * 0.2
    const tiltY = state.pointer.x * 0.25
    group.current.rotation.y = 0.35 + Math.sin(t * 0.35) * 0.4 + tiltY
    group.current.rotation.x = Math.sin(t * 0.25) * 0.06 - tiltX
    group.current.position.y = Math.sin(t * 0.8) * 0.1
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.4]}>
        <circleGeometry args={[1.9, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {/* body */}
      <RoundedBox args={[1.5, 2.9, 0.22]} radius={0.28} smoothness={4}>
        <meshStandardMaterial color="#1a120a" emissive={color} emissiveIntensity={0.06} metalness={0.4} roughness={0.4} />
      </RoundedBox>
      {/* screen */}
      <RoundedBox args={[1.3, 2.62, 0.02]} radius={0.16} smoothness={4} position={[0, 0.02, 0.115]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.1} roughness={0.3} />
      </RoundedBox>
      {/* camera dot */}
      <mesh position={[0, 1.28, 0.13]}>
        <circleGeometry args={[0.045, 16]} />
        <meshBasicMaterial color="#0d0805" />
      </mesh>
      {/* home indicator */}
      <mesh position={[0, -1.16, 0.13]}>
        <boxGeometry args={[0.4, 0.035, 0.01]} />
        <meshBasicMaterial color="#0d0805" />
      </mesh>
    </group>
  )
}

// Fallback visual for web projects (Full Stack / Frontend / Backend) with
// no logo: a stylized 3D browser window — a frame, an address bar with
// traffic-light dots, and a couple of "content" blocks in the accent color.
function StylizedBrowser({ color }) {
  const group = useRef()
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const tiltX = state.pointer.y * 0.15
    const tiltY = state.pointer.x * 0.2
    group.current.rotation.y = Math.sin(t * 0.3) * 0.3 + tiltY
    group.current.rotation.x = 0.12 + Math.sin(t * 0.25) * 0.04 - tiltX
    group.current.position.y = Math.sin(t * 0.8) * 0.1
  })

  const w = 2.7, h = 1.75, depth = 0.12, barH = 0.28
  const dotY = h / 2 - barH / 2
  const dotXs = [-w / 2 + 0.16, -w / 2 + 0.3, -w / 2 + 0.44]

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.4]}>
        <circleGeometry args={[1.9, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {/* window frame */}
      <RoundedBox args={[w, h, depth]} radius={0.09} smoothness={4}>
        <meshStandardMaterial color="#1a120a" emissive={color} emissiveIntensity={0.05} metalness={0.3} roughness={0.5} />
      </RoundedBox>
      {/* address bar */}
      <mesh position={[0, dotY, depth / 2 + 0.006]}>
        <planeGeometry args={[w - 0.06, barH - 0.05]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} />
      </mesh>
      {dotXs.map((x, i) => (
        <mesh key={i} position={[x, dotY, depth / 2 + 0.012]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color={i === 1 ? '#fff3e2' : '#1a120a'} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* content area */}
      <mesh position={[0, -barH / 2 - 0.02, depth / 2 + 0.006]}>
        <planeGeometry args={[w - 0.16, h - barH - 0.16]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
      {/* a couple of "text line" bars, suggesting page content */}
      {[0.28, 0].map((yOff, i) => (
        <mesh key={i} position={[-w / 2 + 0.55 + i * 0.1, -barH / 2 - 0.02 + yOff, depth / 2 + 0.012]}>
          <planeGeometry args={[1.3 - i * 0.35, 0.1]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  )
}

const WEB_CATEGORIES = ['Full Stack', 'Frontend', 'Backend']

function ProjectVisual({ project }) {
  if (project.logo_url) return <LogoPlate url={project.logo_url} color={project.color} />
  if (project.category === 'Mobile') return <StylizedPhone color={project.color} />
  if (WEB_CATEGORIES.includes(project.category)) return <StylizedBrowser color={project.color} />
  return <RotatingGeo color={project.color} />
}

export default function ProjectDetail() {
  const { id } = useParams()
  const getProject = useProjectStore(s => s.getProject)
  const projects = useProjectStore(s => s.projects)
  const fetchProjects = useProjectStore(s => s.fetchProjects)

  const { t } = usePrefs()
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
        <span className="mono" style={{ color: 'var(--plasma)', animation: 'pulse 1.5s infinite' }}>{t('common.loading')}</span>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="detail-notfound page-enter">
        <div className="container">
          <span className="mono" style={{ color: 'var(--nova)' }}>{t('projectDetail.status404')}</span>
          <h1>{t('projectDetail.lost')}</h1>
          <Link to="/projects" className="btn btn--outline">← {t('common.backToProjects')}</Link>
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
          <span className="mono">{t('common.backToProjects')}</span>
        </Link>

        <div className="detail__hero">
          <div className="detail__hero-content">
            <div className="detail__meta">
              <span className="tag" style={{ color: project.color, borderColor: `color-mix(in srgb, ${project.color} 30%, transparent)` }}>
                {t(`categories.${project.category}`)}
              </span>
              <span className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{project.year}</span>
              {project.status && <span className="detail__status">{project.status}</span>}
            </div>

            <h1 className="detail__title" style={{ '--accent': project.color }}>{project.title}</h1>
            <p className="detail__short">{project.short}</p>

            <div className="detail__links">
              {project.links?.live && (
                <a href={project.links.live} target="_blank" rel="noopener" className="btn btn--primary" style={{ background: project.color }}>
                  {t('projectDetail.viewLive')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10"/>
                  </svg>
                </a>
              )}
              {project.links?.github && (
                <a href={project.links.github} target="_blank" rel="noopener" className="btn btn--ghost">{t('projectDetail.github')}</a>
              )}
            </div>
          </div>

          <div className="detail__visual">
            <div className="detail__canvas-wrap" style={{ '--accent': project.color }}>
              <Canvas camera={{ position: [0, 0, 5] }} style={{ background: 'transparent' }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} color={project.color} intensity={2} />
                <pointLight position={[-5, -5, -5]} color="#d9622b" intensity={1} />
                <ProjectVisual project={project} />
              </Canvas>
            </div>
          </div>
        </div>

        <div className="detail__divider" />

        <div className="detail__body">
          <div className="detail__description">
            <h2 className="detail__section-title">{t('projectDetail.about')}</h2>
            <div className="detail__text detail__markdown">
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>
          </div>

          <div className="detail__sidebar">
            <div className="detail__info-block">
              <h3 className="detail__info-label mono">{t('projectDetail.techStack')}</h3>
              <div className="detail__tech">
                {(project.tech || []).map(tech => (
                  <span key={tech} className="detail__tech-item">{tech}</span>
                ))}
              </div>
            </div>
            <div className="detail__info-block">
              <h3 className="detail__info-label mono">{t('projectDetail.metadata')}</h3>
              <dl className="detail__dl">
                <dt>{t('projectDetail.year')}</dt><dd>{project.year}</dd>
                <dt>{t('projectDetail.category')}</dt><dd>{t(`categories.${project.category}`)}</dd>
                <dt>{t('projectDetail.status')}</dt><dd style={{ color: project.color }}>{project.status || 'N/A'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="detail__divider" />

        <nav className="detail__nav">
          {prev ? (
            <Link to={`/projects/${prev.id}`} className="detail__nav-item detail__nav-item--prev">
              <span className="mono">{t('projectDetail.previous')}</span>
              <strong>{prev.title}</strong>
            </Link>
          ) : <div />}
          {next ? (
            <Link to={`/projects/${next.id}`} className="detail__nav-item detail__nav-item--next">
              <span className="mono">{t('projectDetail.next')}</span>
              <strong>{next.title}</strong>
            </Link>
          ) : <div />}
        </nav>
      </div>
    </div>
  )
}
