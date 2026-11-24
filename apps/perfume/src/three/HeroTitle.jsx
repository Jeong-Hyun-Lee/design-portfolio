import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { fontsReady, heroTitleTexture } from './textures.js'
import { rig } from '../rig.js'

const DEPTH = -1.8 // behind the bottle, so the glass refracts the letters
// thin white beams further back: the glass splits them into the prism fringes (TOP_DESIGN)
const BEAMS = [
  { x: -0.34, width: 0.03, phase: 0 },
  { x: 0.12, width: 0.016, phase: 1.7 },
  { x: 0.3, width: 0.045, phase: 3.1 },
]
const BEAM_TILT = 0.38

/** Hero backdrop: the giant "윤슬" and a few light beams, both fading as the hero scrolls away. */
export default function HeroTitle({ isReducedMotion }) {
  const camera = useThree((s) => s.camera)
  const viewport = useThree((s) => s.viewport)
  const [texture, setTexture] = useState(null)
  const group = useRef(null)
  const title = useRef(null)
  const beams = useRef([])

  useEffect(() => {
    let isLive = true
    let made = null
    fontsReady().then(() => {
      if (!isLive) return
      made = heroTitleTexture()
      setTexture(made)
    })
    return () => {
      isLive = false
      made?.dispose()
    }
  }, [])

  const vp = viewport.getCurrentViewport(camera, [0, 0, DEPTH])
  const isPortrait = vp.width < vp.height
  // portrait: the word sits above the bottle's shoulders instead of being hidden behind it
  const width = isPortrait ? vp.width * 1.05 : Math.min(vp.width * 0.94, vp.height * 1.5)
  const titleY = isPortrait ? vp.height * 0.29 : vp.height * 0.04

  useFrame((state, delta) => {
    const fade = 1 - Math.min(1, rig.stage * 1.6)
    const g = group.current
    g.visible = fade > 0.001
    if (!g.visible) return
    const k = 1 - Math.exp(-3 * delta)
    g.position.x = THREE.MathUtils.lerp(g.position.x, -state.pointer.x * 0.18, k)
    g.position.y = THREE.MathUtils.lerp(g.position.y, rig.stage * 0.8, k)
    if (title.current) title.current.material.opacity = fade
    const time = isReducedMotion ? 0 : state.clock.elapsedTime
    beams.current.forEach((mesh, i) => {
      mesh.material.opacity = fade * (0.18 + 0.14 * Math.sin(time * 0.7 + BEAMS[i].phase))
    })
  })

  return (
    <group ref={group} position-z={DEPTH}>
      {texture && (
        <mesh ref={title} position-y={titleY}>
          <planeGeometry args={[width, width / 2]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {BEAMS.map((b, i) => (
        <mesh
          key={i}
          ref={(m) => (beams.current[i] = m)}
          position={[b.x * vp.width, 0, -0.6]}
          rotation-z={BEAM_TILT}
        >
          <planeGeometry args={[b.width, vp.height * 1.6]} />
          <meshBasicMaterial color={[2, 2, 2]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}
