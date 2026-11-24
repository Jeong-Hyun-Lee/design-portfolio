import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import RoomLight from './RoomLight.jsx'
import { SEGMENTS, SEG_LEN, SHAPES, layout, toAngles, wrapAngle } from './shapes.js'

const THICKNESS = 0.16
const DEPTH = 1.6
const FOLD_SPEED = 3.2 // damping factor; higher folds faster
const FIT_SIZE = 9 // world units the widest shape needs

function Strip({ shape, reducedMotion }) {
  const group = useRef(null)
  const segRefs = useRef([])
  const jointRefs = useRef([])
  const current = useRef(toAngles(SHAPES.flat))
  const target = useMemo(() => toAngles(SHAPES[shape]), [shape])

  const parts = useMemo(
    () => ({
      // exact length: seams show the blue joint behind them, like scribed fold lines
      segGeo: new THREE.BoxGeometry(SEG_LEN, THICKNESS, DEPTH),
      jointGeo: new THREE.CylinderGeometry(THICKNESS * 0.49, THICKNESS * 0.49, DEPTH - 0.01, 24),
      steel: new THREE.MeshStandardMaterial({ color: '#aab0b6', metalness: 1, roughness: 0.22 }),
      mark: new THREE.MeshStandardMaterial({ color: '#2b47c9', metalness: 0.5, roughness: 0.45 }),
    }),
    [],
  )
  useEffect(() => () => Object.values(parts).forEach((p) => p.dispose()), [parts])

  useFrame((state, dt) => {
    const step = (from, to) => (reducedMotion ? to : THREE.MathUtils.damp(from, to, FOLD_SPEED, dt))
    const prev = current.current
    const next = {
      base: step(prev.base, prev.base + wrapAngle(target.base - prev.base)),
      hinges: prev.hinges.map((h, i) => step(h, target.hinges[i])),
    }
    current.current = next

    const { segments, joints } = layout(next.base, next.hinges)
    segments.forEach((s, i) => {
      segRefs.current[i].position.set(s.x, s.y, 0)
      segRefs.current[i].rotation.z = s.angle
    })
    joints.forEach((j, i) => jointRefs.current[i].position.set(j.x, j.y, 0))

    const g = group.current
    const fit = Math.min(1, state.viewport.width / FIT_SIZE, state.viewport.height / (FIT_SIZE * 0.75))
    g.scale.setScalar(fit)
    g.rotation.x = step(g.rotation.x, -0.38 - state.pointer.y * 0.18)
    g.rotation.y = step(g.rotation.y, 0.42 + state.pointer.x * 0.3)
  })

  return (
    <group ref={group}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <mesh key={`s${i}`} ref={(el) => (segRefs.current[i] = el)} geometry={parts.segGeo} material={parts.steel} />
      ))}
      {Array.from({ length: SEGMENTS - 1 }, (_, i) => (
        <mesh
          key={`j${i}`}
          ref={(el) => (jointRefs.current[i] = el)}
          geometry={parts.jointGeo}
          material={parts.mark}
          rotation-x={Math.PI / 2}
        />
      ))}
    </group>
  )
}

export default function FoldScene({ shape, reducedMotion, isActive }) {
  return (
    <Canvas camera={{ position: [0, 0, 11], fov: 35 }} dpr={[1, 2]} frameloop={isActive ? 'always' : 'never'}>
      <RoomLight />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-6, -2, 3]} intensity={0.5} />
      <Strip shape={shape} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
