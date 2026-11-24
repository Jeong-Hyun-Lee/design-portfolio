import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import {
  APOTHEM,
  CAP,
  COLLAR,
  FACET_TURN,
  FACETS,
  FILL,
  GLASS,
  LABEL,
  LIQUID,
  LIQUID_Y,
  TUBE,
  explodeOffsets,
  volumeScale,
} from './bottleShape.js'
import { createLiquidMaterial } from './liquidMaterial.js'
import { drawLabel, fontsReady, labelTexture } from './textures.js'
import { rig } from '../rig.js'
import { PARTS } from '../content.js'
import { scentById, useConfig } from '../config.js'

const CAP_FINISH = {
  chrome: { color: new THREE.Color('#f2f2f2'), metalness: 1, roughness: 0.06 },
  brass: { color: new THREE.Color('#e3bd6e'), metalness: 1, roughness: 0.16 },
  matte: { color: new THREE.Color('#151515'), metalness: 0.3, roughness: 0.72 },
}

// liquid slosh: an underdamped spring chasing a tilt set by how fast the bottle moves
const SLOSH_K = 70
const SLOSH_DAMP = 3.5
const SLOSH_MAX = 0.28

/** World position of the part the exploded view describes; Effects focuses the lens there. */
export const focusPoint = new THREE.Vector3()

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (t) => t * t * (3 - 2 * t)
const clampTilt = (v) => Math.max(-SLOSH_MAX, Math.min(SLOSH_MAX, v))
const HOME_Y = { cap: CAP.y, collar: COLLAR.y, tube: TUBE.y, glass: 0, liquid: 0, label: LABEL.y }

/** Lathe with flat shading: each of the FACETS sides becomes a cut face. */
function facetedLathe(profile) {
  const lathe = new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    FACETS,
  )
  const flat = lathe.toNonIndexed()
  flat.computeVertexNormals()
  lathe.dispose()
  return flat
}

/** Label texture, redrawn whenever the configuration changes or the web fonts arrive. */
function useLabel(config) {
  const scent = scentById(config.scent)
  const label = useMemo(labelTexture, [])
  const [hasFonts, setHasFonts] = useState(false)

  useEffect(() => {
    let isLive = true
    fontsReady().then(() => isLive && setHasFonts(true))
    return () => {
      isLive = false
    }
  }, [])

  useEffect(() => {
    drawLabel(label.canvas, { no: scent.no, name: scent.name, ml: config.volume, engraving: config.engraving })
    label.texture.needsUpdate = true
  }, [label, scent, config.volume, config.engraving, hasFonts])

  useEffect(() => () => label.texture.dispose(), [label])
  return label.texture
}

/** Damped spring per axis: the liquid surface lags behind the bottle and sloshes back. */
function updateSlosh(motion, group, dt) {
  group.getWorldPosition(motion.now)
  const vx = (motion.now.x - motion.last.x) / dt
  const vy = (motion.now.y - motion.last.y) / dt
  motion.last.copy(motion.now)
  const turn = group.parent.rotation.y
  const spin = (turn - motion.lastTurn) / dt
  motion.lastTurn = turn
  const target = { x: clampTilt(-vx * 0.08 - spin * 0.04), y: clampTilt(vy * 0.06 + rig.velocity * 0.00003) }
  for (const axis of ['x', 'y']) {
    motion.speed[axis] += (SLOSH_K * (target[axis] - motion.tilt[axis]) - SLOSH_DAMP * motion.speed[axis]) * dt
    motion.tilt[axis] += motion.speed[axis] * dt
  }
  return motion.tilt
}

/**
 * The flacon: faceted crystal (transmission + chromatic aberration), sloshing liquid shader,
 * configurable cap, printed label. Parts fly apart for the exploded view.
 * @param {{ isLite: boolean }} props
 */
export default function Bottle({ isLite }) {
  const config = useConfig()
  const root = useRef(null)
  const cap = useRef(null)
  const collar = useRef(null)
  const tube = useRef(null)
  const glass = useRef(null)
  const liquid = useRef(null)
  const label = useRef(null)
  const capMaterial = useRef(null)
  const labelMap = useLabel(config)

  const glassGeometry = useMemo(() => facetedLathe(GLASS), [])
  const liquidGeometry = useMemo(() => facetedLathe(LIQUID), [])
  const capGeometry = useMemo(() => new THREE.CylinderGeometry(CAP.radius, CAP.radius, CAP.height, FACETS), [])
  const liquidMaterial = useMemo(() => createLiquidMaterial(LIQUID_Y.min + (LIQUID_Y.max - LIQUID_Y.min) * FILL), [])
  useEffect(
    () => () => [glassGeometry, liquidGeometry, capGeometry, liquidMaterial].forEach((o) => o.dispose()),
    [glassGeometry, liquidGeometry, capGeometry, liquidMaterial],
  )

  const liquidTarget = useMemo(() => new THREE.Color(), [])
  const motion = useMemo(
    () => ({ now: new THREE.Vector3(), last: new THREE.Vector3(), lastTurn: 0, tilt: new THREE.Vector2(), speed: new THREE.Vector2() }),
    [],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const k = 1 - Math.exp(-6 * dt)
    const g = root.current

    // configuration: volume, juice colour, cap finish (all eased, never snapped)
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, volumeScale(config.volume), k))
    liquidTarget.set(scentById(config.scent).liquid)
    liquidMaterial.uniforms.uColor.value.lerp(liquidTarget, k)
    liquidMaterial.uniforms.uTime.value = state.clock.elapsedTime
    liquidMaterial.uniforms.uTilt.value.copy(updateSlosh(motion, g, dt))
    const finish = CAP_FINISH[config.cap] ?? CAP_FINISH.chrome
    const m = capMaterial.current
    m.color.lerp(finish.color, k)
    m.metalness = THREE.MathUtils.lerp(m.metalness, finish.metalness, k)
    m.roughness = THREE.MathUtils.lerp(m.roughness, finish.roughness, k)

    // exploded view: opens over the first quarter of the anatomy scroll, closes as the light comes
    const t = smooth(clamp01(rig.anatomy * 4)) * (1 - clamp01(rig.stage - 2))
    rig.explode = t
    const offsets = explodeOffsets(t)
    const refs = { cap, collar, tube, glass, liquid, label }
    for (const [name, ref] of Object.entries(refs)) {
      const [x, y, z] = offsets[name]
      ref.current.position.set(x, HOME_Y[name] + y, (name === 'label' ? APOTHEM + 0.004 : 0) + z)
    }
    const focus = PARTS[Math.min(PARTS.length - 1, Math.floor(rig.anatomy * PARTS.length))].part
    refs[focus].current.getWorldPosition(focusPoint)
  })

  return (
    <group ref={root}>
      <group ref={cap}>
        <mesh geometry={capGeometry} rotation-y={FACET_TURN}>
          <meshStandardMaterial ref={capMaterial} flatShading color="#f2f2f2" metalness={1} roughness={0.06} />
        </mesh>
      </group>
      <group ref={collar}>
        <mesh>
          <cylinderGeometry args={[COLLAR.radius, COLLAR.radius, COLLAR.height, 32]} />
          <meshStandardMaterial color="#d9d9d9" metalness={1} roughness={0.14} />
        </mesh>
      </group>
      <group ref={tube}>
        <mesh>
          <cylinderGeometry args={[TUBE.radius, TUBE.radius, TUBE.height, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.45} roughness={0.2} />
        </mesh>
      </group>
      <group ref={glass}>
        <mesh geometry={glassGeometry} rotation-y={FACET_TURN}>
          <MeshTransmissionMaterial
            backside={!isLite}
            backsideThickness={0.35}
            thickness={0.3}
            samples={isLite ? 4 : 8}
            resolution={isLite ? 256 : 512}
            chromaticAberration={0.6}
            anisotropicBlur={0.05}
            distortion={0.02}
            distortionScale={0.4}
            temporalDistortion={0}
            roughness={0.02}
            ior={1.48}
            clearcoat={1}
            clearcoatRoughness={0.04}
            color="#ffffff"
          />
        </mesh>
      </group>
      <group ref={liquid}>
        <mesh geometry={liquidGeometry} material={liquidMaterial} rotation-y={FACET_TURN} />
      </group>
      <group ref={label}>
        <mesh renderOrder={2}>
          <planeGeometry args={[LABEL.width, LABEL.height]} />
          <meshBasicMaterial map={labelMap} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
