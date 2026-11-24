import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import Bottle from './Bottle.jsx'
import NoteParticles from './NoteParticles.jsx'
import HeroTitle from './HeroTitle.jsx'
import Wordmark from './Wordmark.jsx'
import Effects from './Effects.jsx'
import { lightness, poseAt, rig, stageKeyframes } from '../rig.js'
import { scentById, useConfig } from '../config.js'

const DARK = new THREE.Color('#101010')
const NIGHT = new THREE.Color('#050505')
const TAU = Math.PI * 2
const SPIN_SPEED = 0.35 // rad/s while the bottle is on the dark stage
const clamp01 = (v) => Math.min(1, Math.max(0, v))

/** Scene background: obsidian, then the chosen scent's gallery wall, then night for the close. */
function Backdrop() {
  const scene = useThree((s) => s.scene)
  const { scent } = useConfig()
  const wall = useMemo(() => new THREE.Color(scentById(scent).wall), [scent])
  const color = useMemo(() => DARK.clone(), [])
  const target = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    scene.background = color
    return () => {
      scene.background = null
    }
  }, [scene, color])

  useFrame((_, delta) => {
    target.copy(DARK).lerp(wall, lightness(rig.stage)).lerp(NIGHT, clamp01(rig.stage - 3))
    color.lerp(target, 1 - Math.exp(-8 * delta))
  })
  return null
}

/** Reflections come from these softboxes, rendered once into a local cube map (no HDR download). */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={5} position={[0, 5, -2]} rotation-x={Math.PI / 2} scale={[6, 3, 1]} />
      <Lightformer form="rect" intensity={6} position={[-4, 1, 1]} rotation-y={Math.PI / 2} scale={[0.4, 6, 1]} />
      <Lightformer form="rect" intensity={6} position={[4, 1, 1]} rotation-y={-Math.PI / 2} scale={[0.4, 6, 1]} />
      <Lightformer form="rect" intensity={2} position={[0, -0.5, 6]} scale={[6, 0.5, 1]} />
      <Lightformer form="rect" intensity={1} position={[0, 0, 9]} scale={[12, 8, 1]} />
      <Lightformer form="rect" intensity={4} position={[-2.2, 0, 6]} scale={[0.3, 8, 1]} />
      <Lightformer form="rect" intensity={4} position={[2.2, 0, 6]} scale={[0.3, 8, 1]} />
      <Lightformer form="ring" intensity={2.5} color="#ffd9b0" position={[2.5, 3, -4]} scale={2} />
    </Environment>
  )
}

/** Moves the bottle (and the particles around it) between the stage keyframes as the page scrolls. */
function Stage({ isPortrait, isReducedMotion, children }) {
  const group = useRef(null)
  const spin = useRef(0)
  const viewport = useThree((s) => s.viewport)
  const frames = useMemo(() => stageKeyframes(isPortrait), [isPortrait])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const g = group.current
    const k = 1 - Math.exp(-5 * dt)
    const pose = poseAt(rig.stage, frames)
    const bob = isReducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.04
    g.position.x = THREE.MathUtils.lerp(g.position.x, pose.x * viewport.width, k)
    g.position.y = THREE.MathUtils.lerp(g.position.y, pose.y * viewport.height + bob, k)
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, pose.scale, k))

    // spin on the dark stage; in the light (configurator) settle with the label facing forward
    if (lightness(rig.stage) < 0.5 && !isReducedMotion) spin.current += dt * SPIN_SPEED * (1 - rig.explode * 0.6)
    else spin.current = THREE.MathUtils.damp(spin.current, Math.round(spin.current / TAU) * TAU, 3, dt)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, spin.current + state.pointer.x * 0.35, k)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.04 - state.pointer.y * 0.12, k)
  })

  return <group ref={group}>{children}</group>
}

/**
 * The one fixed, full-screen WebGL scene behind every section. DOM sections scroll over it and
 * write progress into `rig`; nothing here re-renders on scroll.
 * @param {{ isPortrait: boolean, isLite: boolean, isReducedMotion: boolean, isPaused: boolean }} props
 */
export default function Experience({ isPortrait, isLite, isReducedMotion, isPaused }) {
  const [dpr, setDpr] = useState(isLite ? 1 : 1.5)
  const maxDpr = Math.min(window.devicePixelRatio || 1, isLite ? 1.5 : 2)

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      dpr={dpr}
      camera={{ position: [0, 0, 7], fov: 30, near: 0.1, far: 40 }}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      frameloop={isPaused ? 'never' : 'always'}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(maxDpr)} flipflops={3} onFallback={() => setDpr(1)} />
      <Backdrop />
      <Studio />
      <HeroTitle isReducedMotion={isReducedMotion} />
      <Stage isPortrait={isPortrait} isReducedMotion={isReducedMotion}>
        <Bottle isLite={isLite} />
        {/* tilted toward the camera so the magnolia and the ripples read as discs, not lines */}
        <group scale={0.85} rotation-x={0.8}>
          <NoteParticles size={isLite ? 112 : 192} isReducedMotion={isReducedMotion} />
        </group>
      </Stage>
      <Wordmark isReducedMotion={isReducedMotion} />
      <Effects isLite={isLite} isReducedMotion={isReducedMotion} />
    </Canvas>
  )
}
