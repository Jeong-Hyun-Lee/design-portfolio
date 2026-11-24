import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeMediaTexture, makeWoodTexture } from './textures.js'

// Cut-away exhibition room: floor, back + left wall, a projection screen, one placed panel
// (the uploaded file) and a few avatars. Units are roughly metres.
const W = 6
const D = 4.4
const H = 2.6
const ORANGE = '#ff7714'
const PANEL_SIZE = { landscape: [1.6, 0.9], portrait: [0.9, 1.6] }

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeOut = (t) => 1 - (1 - t) ** 3

/** Panel resting pose on the back wall. Playground slider values are offsets from this. */
export const PANEL_HOME = { x: 0, y: 1.35, z: -D / 2 + 0.16, rotY: 0, scale: 1 }

/**
 * The "arrange" build step: the panel is nudged along X, Y and Z, turned and resized,
 * then settles back home. Build.jsx uses the same curve to drive its editor meters.
 * @param {number} a 0..1
 */
export function arrangePose(a) {
  const s = Math.sin(a * Math.PI)
  return {
    x: PANEL_HOME.x + s * 1.1,
    y: PANEL_HOME.y + Math.sin(a * Math.PI * 2) * 0.25,
    z: PANEL_HOME.z + s * 0.3,
    rotY: s * 0.4,
    scale: 1 + s * 0.3,
  }
}

/** Split overall build progress (0..1) into the four steps of STEPS. */
export function buildPhases(p) {
  return {
    walls: easeOut(clamp01(p * 4)),
    panel: easeOut(clamp01(p * 4 - 1)),
    arrange: clamp01(p * 4 - 2),
    people: easeOut(clamp01(p * 4 - 3)),
  }
}

const AVATARS = [
  { cx: 0.1, cz: 0.5, r: 0.35, speed: 0.35, phase: 0 },
  { cx: -1.5, cz: 0.3, r: 0.5, speed: -0.25, phase: 2 },
  { cx: 1.5, cz: 0.9, r: 0.4, speed: 0.3, phase: 4 },
]

function useRoomKit() {
  const kit = useMemo(() => {
    const wood = makeWoodTexture()
    const media = { video: makeMediaTexture('video'), doc: makeMediaTexture('doc') }
    const geo = {
      floor: new THREE.BoxGeometry(W, 0.14, D),
      backWall: new THREE.BoxGeometry(W, H, 0.12),
      sideWall: new THREE.BoxGeometry(0.12, H, D),
      window: new THREE.BoxGeometry(0.02, 0.9, D * 0.8),
      screen: new THREE.BoxGeometry(4.4, 2.0, 0.03),
      screenBar: new THREE.BoxGeometry(4.5, 0.08, 0.06),
      panel: new THREE.PlaneGeometry(1, 1),
      panelEdge: new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.04, 1.06)),
      model: new THREE.TorusKnotGeometry(0.28, 0.09, 160, 20),
      modelEdge: new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 0.9, 0.9)),
      plinth: new THREE.CylinderGeometry(0.35, 0.4, 0.5, 48),
      body: new THREE.CapsuleGeometry(0.13, 0.42, 4, 12),
      head: new THREE.SphereGeometry(0.11, 20, 16),
    }
    const mat = {
      floor: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55 }),
      wall: new THREE.MeshStandardMaterial({ color: '#f3f3f1', roughness: 0.9 }),
      window: new THREE.MeshBasicMaterial({ color: '#eef5ff' }),
      screen: new THREE.MeshStandardMaterial({ color: '#fafaf8', roughness: 0.8 }),
      dark: new THREE.MeshStandardMaterial({ color: '#222222', roughness: 0.5 }),
      panel: new THREE.MeshBasicMaterial({ map: media.video, toneMapped: false }),
      edge: new THREE.LineBasicMaterial({ color: ORANGE }),
      model: new THREE.MeshStandardMaterial({ color: '#c9cbce', metalness: 1, roughness: 0.2 }),
      suit: new THREE.MeshStandardMaterial({ color: '#1f1c1b', roughness: 0.7 }),
      skin: new THREE.MeshStandardMaterial({ color: '#d9b79a', roughness: 0.8 }),
    }
    return { geo, mat, textures: [wood, media.video, media.doc], media }
  }, [])

  useEffect(
    () => () => {
      ;[...Object.values(kit.geo), ...Object.values(kit.mat), ...kit.textures].forEach((x) => x.dispose())
    },
    [kit],
  )
  return kit
}

/**
 * @param {object} props
 * @param {{ current: number } | null} [props.build] build progress 0..1; null = fully built
 * @param {{ x, y, z, rotY, scale } | null} [props.pose] explicit panel pose (playground)
 * @param {'video' | 'doc' | 'model'} [props.media]
 * @param {'landscape' | 'portrait'} [props.orientation]
 */
export default function RoomModel({ build = null, pose = null, media = 'video', orientation = 'landscape' }) {
  const { geo, mat, media: mediaTextures } = useRoomKit()
  const walls = useRef(null)
  const panel = useRef(null)
  const model = useRef(null)
  const avatars = useRef([])
  const target = useRef(pose)

  useEffect(() => {
    target.current = pose
  }, [pose])

  useEffect(() => {
    if (media !== 'model') {
      mat.panel.map = mediaTextures[media]
      mat.panel.needsUpdate = true
    }
  }, [media, mat, mediaTextures])

  useFrame((state, dt) => {
    const phase = buildPhases(build ? build.current : 1)
    walls.current.position.y = (1 - phase.walls) * 3.2

    const goal = target.current
      ? { ...PANEL_HOME, ...target.current, x: PANEL_HOME.x + target.current.x, y: PANEL_HOME.y + target.current.y, z: PANEL_HOME.z + target.current.z }
      : arrangePose(phase.arrange)
    const p = panel.current
    const damp = (from, to) => THREE.MathUtils.damp(from, to, 8, dt)
    p.visible = phase.panel > 0.001
    p.position.set(damp(p.position.x, goal.x), damp(p.position.y, goal.y + (1 - phase.panel) * 2.4), damp(p.position.z, goal.z))
    p.rotation.y = damp(p.rotation.y, goal.rotY)
    p.scale.setScalar(damp(p.scale.x, goal.scale))
    model.current.rotation.y += dt * 0.6
    model.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.25

    avatars.current.forEach((a, i) => {
      const cfg = AVATARS[i]
      const t = state.clock.elapsedTime * cfg.speed + cfg.phase
      a.position.set(cfg.cx + Math.cos(t) * cfg.r, 0, cfg.cz + Math.sin(t) * cfg.r)
      a.rotation.y = -t + (cfg.speed > 0 ? 0 : Math.PI)
      a.scale.setScalar(Math.max(0.001, phase.people))
    })
  })

  const [pw, ph] = PANEL_SIZE[orientation]
  const isModel = media === 'model'

  return (
    <group>
      <mesh geometry={geo.floor} material={mat.floor} position={[0, -0.07, 0]} />
      <group ref={walls}>
        <mesh geometry={geo.backWall} material={mat.wall} position={[0, H / 2, -D / 2]} />
        <mesh geometry={geo.sideWall} material={mat.wall} position={[-W / 2, H / 2, 0]} />
        <mesh geometry={geo.window} material={mat.window} position={[-W / 2 + 0.07, 1.75, 0]} />
        <mesh geometry={geo.screen} material={mat.screen} position={[0, 1.35, -D / 2 + 0.075]} />
        <mesh geometry={geo.screenBar} material={mat.dark} position={[0, 2.38, -D / 2 + 0.09]} />
      </group>

      {/* the uploaded file; its outline is the "selected" state from the editor */}
      <group ref={panel} position={[PANEL_HOME.x, PANEL_HOME.y, PANEL_HOME.z]}>
        <group visible={!isModel} scale={[pw, ph, 1]}>
          <mesh geometry={geo.panel} material={mat.panel} />
          <lineSegments geometry={geo.panelEdge} material={mat.edge} />
        </group>
        <group visible={isModel} position={[0, -0.05, 0.6]}>
          <mesh ref={model} geometry={geo.model} material={mat.model} />
          <lineSegments geometry={geo.modelEdge} material={mat.edge} />
          <mesh geometry={geo.plinth} material={mat.wall} position={[0, -1.05, 0]} />
        </group>
      </group>

      {AVATARS.map((cfg, i) => (
        <group key={i} ref={(el) => (avatars.current[i] = el)}>
          <mesh geometry={geo.body} material={mat.suit} position={[0, 0.38, 0]} />
          <mesh geometry={geo.head} material={mat.skin} position={[0, 0.8, 0]} />
        </group>
      ))}
    </group>
  )
}
