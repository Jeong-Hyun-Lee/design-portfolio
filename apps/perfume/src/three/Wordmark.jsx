import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { STROKES, WORDMARK_SIZE } from './wordmark.js'
import { rig } from '../rig.js'

const STROKE = 0.075 // tube radius, in wordmark units
const clamp01 = (v) => Math.min(1, Math.max(0, v))

/** One capsule per straight stroke, one torus for ㅇ: chrome tubes like bent neon glass. */
function strokeMeshes() {
  return STROKES.map((s, i) => {
    if (s.ring) {
      return { key: i, geometry: new THREE.TorusGeometry(s.r, STROKE, 20, 64), position: [s.ring[0], s.ring[1], 0], rotationZ: 0 }
    }
    const [[x0, y0], [x1, y1]] = s.line
    const length = Math.hypot(x1 - x0, y1 - y0)
    return {
      key: i,
      geometry: new THREE.CapsuleGeometry(STROKE, length, 8, 20),
      position: [(x0 + x1) / 2, (y0 + y1) / 2, 0],
      rotationZ: Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2,
    }
  })
}

/** Closing mark (Hyper Tria): chrome "윤슬" rising out of the dark once the closing section arrives. */
export default function Wordmark({ isReducedMotion }) {
  const group = useRef(null)
  const viewport = useThree((s) => s.viewport)
  const meshes = useMemo(strokeMeshes, [])
  useEffect(() => () => meshes.forEach((m) => m.geometry.dispose()), [meshes])

  useFrame((state, delta) => {
    const g = group.current
    const t = clamp01((rig.stage - 3.35) / 0.65)
    g.visible = t > 0.001
    if (!g.visible) return
    const eased = 1 - (1 - t) ** 3
    const scale = Math.min((viewport.width * 0.62) / WORDMARK_SIZE.width, 1.7)
    g.scale.setScalar(scale * (0.85 + 0.15 * eased))
    g.position.y = (1 - eased) * -1.6 + 0.15
    const k = 1 - Math.exp(-4 * delta)
    const sway = isReducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.5) * 0.12
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, state.pointer.x * 0.45 + sway, k)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.25, k)
  })

  return (
    <group ref={group} visible={false}>
      {meshes.map((m) => (
        <mesh key={m.key} geometry={m.geometry} position={m.position} rotation-z={m.rotationZ}>
          <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.05} />
        </mesh>
      ))}
    </group>
  )
}
