import { useSyncExternalStore } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import RoomLight from '@portfolio/shared/RoomLight.jsx'
import RoomModel from './RoomModel.jsx'

const TARGET = [0, 1.2, -1.2]
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

// Drag-to-orbit only with a mouse: on touch screens it would swallow the page scroll.
function useHasFinePointer() {
  return useSyncExternalStore(
    (onChange) => {
      const q = window.matchMedia(FINE_POINTER)
      q.addEventListener('change', onChange)
      return () => q.removeEventListener('change', onChange)
    },
    () => window.matchMedia(FINE_POINTER).matches,
  )
}

/**
 * The room with the panel driven by the playground controls.
 * @param {{ pose: object, media: string, orientation: string, isActive: boolean }} props
 */
export default function PlaygroundScene({ pose, media, orientation, isActive }) {
  const canOrbit = useHasFinePointer()
  return (
    <Canvas camera={{ position: [3.6, 2.8, 5.4], fov: 34 }} dpr={[1, 2]} frameloop={isActive ? 'always' : 'never'}>
      <RoomLight />
      <directionalLight position={[4, 8, 3]} intensity={1.1} />
      <RoomModel pose={pose} media={media} orientation={orientation} />
      <OrbitControls
        target={TARGET}
        enabled={canOrbit}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.6}
        maxPolarAngle={1.45}
        minAzimuthAngle={-0.2}
        maxAzimuthAngle={1.1}
      />
    </Canvas>
  )
}
