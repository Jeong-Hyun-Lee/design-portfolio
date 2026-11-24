import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import RoomLight from '@portfolio/shared/RoomLight.jsx'
import RoomModel from './RoomModel.jsx'
import Lasers from './Lasers.jsx'

const LOOK_AT = [0, 0.9, 0]
const FIT_WIDTH = 9 // world units the room needs across

function LookAt() {
  const camera = useThree((s) => s.camera)
  useEffect(() => camera.lookAt(...LOOK_AT), [camera])
  return null
}

/** Floating diorama: bobs, follows the pointer, and lifts/turns away as the hero scrolls. */
function Rig({ progress, children }) {
  const group = useRef(null)
  useFrame((state, dt) => {
    const g = group.current
    const p = progress.current
    const damp = (from, to) => THREE.MathUtils.damp(from, to, 4, dt)
    g.scale.setScalar(Math.min(1, state.viewport.width / FIT_WIDTH))
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06 + p * 1.4
    g.rotation.y = damp(g.rotation.y, state.pointer.x * 0.25 + p * 0.9)
    g.rotation.x = damp(g.rotation.x, -state.pointer.y * 0.08)
  })
  return <group ref={group}>{children}</group>
}

/** @param {{ progress: { current: number }, isActive: boolean }} props */
export default function HeroScene({ progress, isActive }) {
  return (
    <Canvas camera={{ position: [7, 5.4, 8.6], fov: 30 }} dpr={[1, 2]} frameloop={isActive ? 'always' : 'never'}>
      <LookAt />
      <RoomLight />
      <directionalLight position={[4, 8, 3]} intensity={1.1} />
      <Rig progress={progress}>
        <RoomModel />
      </Rig>
      <Lasers fade={progress} />
    </Canvas>
  )
}
