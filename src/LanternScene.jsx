import { Suspense, use, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bounds } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import RoomLight from './RoomLight.jsx'

// Lantern by Microsoft, CC0 (KhronosGroup glTF-Sample-Assets)
const MODEL_URL = `${import.meta.env.BASE_URL}models/lantern.glb`
const TURN = Math.PI * 1.1 // rotation across the whole section scroll
const GLOW_MAX = 4

/** GLB bytes. file:// blocks fetch, so there the build's lantern.glb.js script carries them as base64. */
function readModelBytes() {
  if (location.protocol !== 'file:') {
    return fetch(MODEL_URL).then((res) => {
      if (!res.ok) throw new Error(`lantern model: HTTP ${res.status}`)
      return res.arrayBuffer()
    })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${MODEL_URL}.js`
    script.onload = () => {
      const b64 = window.__lanternGlb
      delete window.__lanternGlb
      const bytes = Uint8Array.fromBase64?.(b64) ?? Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      resolve(bytes.buffer)
    }
    script.onerror = () => reject(new Error('lantern model: script failed to load'))
    document.head.append(script)
  })
}

let modelPromise = null
const loadModel = () => (modelPromise ??= readModelBytes().then((buf) => new GLTFLoader().parseAsync(buf, '')))

function Lantern({ progress }) {
  const { scene } = use(loadModel())
  const spin = useRef(null)
  const glowing = useMemo(() => {
    const mats = []
    scene.traverse((o) => o.isMesh && o.material.emissiveMap && mats.push(o.material))
    return mats
  }, [scene])

  useFrame((_, dt) => {
    const p = progress.current
    spin.current.rotation.y = THREE.MathUtils.damp(spin.current.rotation.y, -0.6 + p * TURN, 4, dt)
    // three materials are mutable by design; the lamp lights up as the section scrolls past
    glowing.forEach((m) => {
      m.emissiveIntensity = THREE.MathUtils.smoothstep(p, 0.2, 0.6) * GLOW_MAX
    })
  })

  return (
    <group ref={spin}>
      <primitive object={scene} />
    </group>
  )
}

/**
 * @param {{ progress: { current: number }, isActive: boolean }} props
 */
export default function LanternScene({ progress, isActive }) {
  return (
    <Canvas camera={{ position: [8, 3, 12], fov: 30 }} dpr={[1, 2]} frameloop={isActive ? 'always' : 'never'}>
      <RoomLight />
      <directionalLight position={[-5, 8, 4]} intensity={0.8} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.15}>
          <Lantern progress={progress} />
        </Bounds>
      </Suspense>
    </Canvas>
  )
}