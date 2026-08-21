import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { usePrefs } from '../lib/preferences.jsx'

// Two readings of the same scene: dark = the night sky itself (bright warm
// specks on black), light = the printed atlas page (the same constellations
// inked in sepia on parchment). Only colors/blending differ between them.
const PALETTES = {
  dark: {
    starColor: '#fff3e2',
    starOpacity: 0.85,
    starCount: 5000,
    starSize: 0.12,
    nebulaColors: [
      [0.949, 0.647, 0.235],
      [0.851, 0.384, 0.169],
      [0.878, 0.282, 0.353],
      [0.22, 0.12, 0.06],
    ],
    nebulaOpacity: 0.28,
    nebulaBlending: THREE.AdditiveBlending,
    orbColors: ['#f2a53c', '#d9622b', '#e0485a'],
    orbOpacity: 0.16,
    sunOpacity: 0.07,
    ringColor: '#d9a34a',
    ringOpacity: 0.22,
    showSun: true,
  },
  light: {
    starColor: '#3a2410',
    starOpacity: 0.16,
    starCount: 2600,
    starSize: 0.08,
    nebulaColors: [
      [0.42, 0.24, 0.1],
      [0.35, 0.14, 0.08],
      [0.4, 0.12, 0.15],
      [0.6, 0.5, 0.35],
    ],
    nebulaOpacity: 0.1,
    nebulaBlending: THREE.NormalBlending,
    orbColors: ['#b5691a', '#a8441b', '#b52f3f'],
    orbOpacity: 0.07,
    sunOpacity: 0,
    ringColor: '#8a5a1f',
    ringOpacity: 0.16,
    showSun: false,
  },
}

function Stars({ count = 6000, color, opacity, size = 0.12 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 120
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [count])

  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.02
    ref.current.rotation.y = state.clock.elapsedTime * 0.015
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity}
      />
    </Points>
  )
}

function NebulaClouds({ palette }) {
  const ref = useRef()
  const count = 800

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20
    }
    return pos
  }, [count])

  const colors = useMemo(() => {
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const c = palette.nebulaColors[Math.floor(Math.random() * palette.nebulaColors.length)]
      col[i * 3] = c[0]
      col[i * 3 + 1] = c[1]
      col[i * 3 + 2] = c[2]
    }
    return col
  }, [count, palette])

  useFrame((state) => {
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
    ref.current.rotation.y = state.clock.elapsedTime * 0.008
  })

  return (
    <Points key={palette.nebulaBlending} ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.5}
        sizeAttenuation
        depthWrite={false}
        opacity={palette.nebulaOpacity}
        blending={palette.nebulaBlending}
      />
    </Points>
  )
}

function FloatingOrb({ position, color, speed, size, opacity }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 2
    ref.current.rotation.y = state.clock.elapsedTime * 0.3
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.45}
        transparent
        opacity={opacity}
        wireframe={false}
      />
    </mesh>
  )
}

// A soft, distant glow — like a hearth-star anchoring the whole scene.
// Dark theme only: on the light "atlas page" a glow would be invisible
// (and pointless) against an already-bright background.
function DistantSun({ opacity }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return   // not mounted when opacity <= 0 (light theme) — skip, don't throw
    const t = state.clock.elapsedTime
    const s = 1 + Math.sin(t * 0.15) * 0.04
    ref.current.scale.set(s, s, s)
  })
  if (opacity <= 0) return null
  return (
    <mesh ref={ref} position={[10, 6, -70]}>
      <sphereGeometry args={[10, 24, 24]} />
      <meshBasicMaterial color="#ffd76a" transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

// Armillary-sphere rings — an antique astronomical instrument, the kind
// engraved on the frontispiece of an old star atlas. Purely decorative,
// slowly turning, brass-warm and faint so it reads as texture, not chrome.
function ArmillarySphere({ position = [0, 0, -35], scale = 1, color, opacity }) {
  const group = useRef()
  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.04
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.15
  })

  const rings = [
    { radius: 14, rot: [Math.PI / 2, 0, 0] },
    { radius: 14, rot: [0, Math.PI / 2.4, 0] },
    { radius: 14, rot: [0.5, 0.9, 0] },
    { radius: 10, rot: [1.1, 0.3, 0.4] },
  ]

  return (
    <group ref={group} position={position} scale={scale}>
      {rings.map((r, i) => (
        <mesh key={i} rotation={r.rot}>
          <torusGeometry args={[r.radius, 0.045, 8, 96]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function SpaceBackground({ intensity = 1 }) {
  const { theme } = usePrefs()
  const palette = PALETTES[theme] || PALETTES.dark

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.16} color="#3a2410" />
        <pointLight position={[10, 10, 10]} color="#f2a53c" intensity={0.6} />
        <pointLight position={[-10, -10, -10]} color="#d9622b" intensity={0.4} />

        <DistantSun opacity={palette.sunOpacity} />
        <Stars count={palette.starCount} color={palette.starColor} opacity={palette.starOpacity} size={palette.starSize} />
        <NebulaClouds palette={palette} />

        <FloatingOrb position={[-15, 5, -10]} color={palette.orbColors[0]} speed={0.4} size={3} opacity={palette.orbOpacity} />
        <FloatingOrb position={[18, -8, -15]} color={palette.orbColors[1]} speed={0.3} size={4} opacity={palette.orbOpacity} />
        <FloatingOrb position={[5, 12, -20]} color={palette.orbColors[2]} speed={0.5} size={2} opacity={palette.orbOpacity} />

        <ArmillarySphere position={[-22, -10, -45]} scale={1.3} color={palette.ringColor} opacity={palette.ringOpacity} />
      </Canvas>
    </div>
  )
}
