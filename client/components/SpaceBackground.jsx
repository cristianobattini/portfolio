import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Stars({ count = 6000 }) {
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
        color="#ffffff"
        size={0.12}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  )
}

function NebulaClouds() {
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
    const palette = [
      [0, 0.96, 1],      // cyan/plasma
      [0.48, 0.18, 1],   // aurora purple
      [1, 0.17, 0.47],   // nova pink
      [0.08, 0.08, 0.5], // deep blue
    ]
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c[0]
      col[i * 3 + 1] = c[1]
      col[i * 3 + 2] = c[2]
    }
    return col
  }, [count])

  useFrame((state) => {
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
    ref.current.rotation.y = state.clock.elapsedTime * 0.008
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.5}
        sizeAttenuation
        depthWrite={false}
        opacity={0.25}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

function FloatingOrb({ position, color, speed, size }) {
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
        emissiveIntensity={0.4}
        transparent
        opacity={0.15}
        wireframe={false}
      />
    </mesh>
  )
}

function GridPlane() {
  return (
    <gridHelper
      args={[200, 40, '#00f5ff', '#1a1a4a']}
      position={[0, -30, 0]}
      rotation={[0, 0, 0]}
    />
  )
}

export default function SpaceBackground({ intensity = 1 }) {
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
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} color="#00f5ff" intensity={0.5} />
        <pointLight position={[-10, -10, -10]} color="#7b2fff" intensity={0.3} />
        
        <Stars count={5000} />
        <NebulaClouds />
        
        <FloatingOrb position={[-15, 5, -10]} color="#00f5ff" speed={0.4} size={3} />
        <FloatingOrb position={[18, -8, -15]} color="#7b2fff" speed={0.3} size={4} />
        <FloatingOrb position={[5, 12, -20]} color="#ff2d78" speed={0.5} size={2} />
        
        <GridPlane />
      </Canvas>
    </div>
  )
}
