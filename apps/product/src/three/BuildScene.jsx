import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import RoomLight from '@portfolio/shared/RoomLight.jsx'
import RoomModel from './RoomModel.jsx'

const LOOK_AT = [0, 0.45, -0.2]
const FIT_WIDTH = 8.5

function LookAt() {
  const camera = useThree((s) => s.camera)
  useEffect(() => camera.lookAt(...LOOK_AT), [camera])
  return null
}

function Turntable({ build, children }) {
  const group = useRef(null)
  useFrame((state, dt) => {
    const g = group.current
    g.scale.setScalar(Math.min(1, state.viewport.width / FIT_WIDTH))
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.35 + build.current * 0.7, 4, dt)
  })
  return <group ref={group}>{children}</group>
}

/** The room assembling step by step; `build` is the section's scroll progress (ref, 0..1). */
export default function BuildScene({ build, isActive }) {
  return (
    <Canvas camera={{ position: [5.4, 4.2, 7.4], fov: 30 }} dpr={[1, 2]} frameloop={isActive ? 'always' : 'never'}>
      <LookAt />
      <RoomLight />
      <directionalLight position={[4, 8, 3]} intensity={1.1} />
      <Turntable build={build}>
        <RoomModel build={build} />
      </Turntable>
    </Canvas>
  )
}
