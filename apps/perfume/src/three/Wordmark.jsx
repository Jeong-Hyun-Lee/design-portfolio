import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import fontData from './perfumeFont.json' // Marcellus (OFL), only the glyphs of BRAND; see CLAUDE.md
import { BRAND } from '../content.js'
import { rig } from '../rig.js'

const clamp01 = (v) => Math.min(1, Math.max(0, v))

/** Extruded logotype with a fine bevel: polished silver lettering, built once and centred. */
function wordmarkGeometry() {
  const font = new FontLoader().parse(fontData)
  const geometry = new TextGeometry(BRAND, {
    font,
    size: 1,
    depth: 0.14,
    curveSegments: 18,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.012,
    bevelSegments: 4,
  })
  geometry.center()
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  return { geometry, width: box.max.x - box.min.x }
}

/** Closing mark (Hyper Tria): silver "Perfume" rising out of the dark once the closing section arrives. */
export default function Wordmark({ isReducedMotion }) {
  const group = useRef(null)
  const viewport = useThree((s) => s.viewport)
  const { geometry, width } = useMemo(wordmarkGeometry, [])
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    const g = group.current
    const t = clamp01((rig.stage - 3.35) / 0.65)
    g.visible = t > 0.001
    if (!g.visible) return
    const eased = 1 - (1 - t) ** 3
    const scale = Math.min((viewport.width * 0.6) / width, 1.1)
    g.scale.setScalar(scale * (0.92 + 0.08 * eased))
    g.position.y = (1 - eased) * -1.2 + 0.25
    const k = 1 - Math.exp(-3 * delta)
    // slow sway so the light strips glide across the letters
    const sway = isReducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.35) * 0.18
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, state.pointer.x * 0.3 + sway, k)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.08 - state.pointer.y * 0.15, k)
  })

  return (
    <group ref={group} visible={false}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#e9e6e1" metalness={1} roughness={0.14} />
      </mesh>
    </group>
  )
}
