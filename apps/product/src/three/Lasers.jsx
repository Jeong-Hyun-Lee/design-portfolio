import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// The hero's only colour: two neon beams crossing the scene and a scrolling laser grid floor.
// Both are custom shaders; `fade` (a ref, 0..1) dims them as the hero scrolls away.
const GREEN = '#38f27a'

const BEAMS = [
  [
    [-8, -0.6, 2.2],
    [8, 2.6, -2.4],
  ],
  [
    [-8, 2.4, -2.6],
    [8, -0.2, 2.6],
  ],
]

const glowVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
// brightest where the cylinder faces the camera, fading to its silhouette: a soft beam halo
const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(abs(dot(normalize(vNormal), normalize(vView))), 2.5);
    gl_FragColor = vec4(uColor, f * uOpacity);
    #include <colorspace_fragment>
  }
`

const gridVertex = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
// anti-aliased grid lines (fwidth) that drift toward the viewer and fade out radially
const gridFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vWorld;
  void main() {
    vec2 g = vWorld * 1.1 + vec2(0.0, uTime * 0.3);
    vec2 cell = abs(fract(g - 0.5) - 0.5) / fwidth(g);
    float line = 1.0 - min(min(cell.x, cell.y), 1.0);
    float fade = smoothstep(9.0, 1.0, length(vWorld));
    gl_FragColor = vec4(uColor, line * fade * uOpacity);
    #include <colorspace_fragment>
  }
`

function beamTransform([from, to]) {
  const a = new THREE.Vector3(...from)
  const b = new THREE.Vector3(...to)
  const dir = b.clone().sub(a)
  const length = dir.length()
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  return { position: a.add(b).multiplyScalar(0.5).toArray(), quaternion: quaternion.toArray(), length }
}

/** @param {{ fade: { current: number }, floorY?: number }} props */
export default function Lasers({ fade, floorY = -0.9 }) {
  const kit = useMemo(() => {
    const color = new THREE.Color(GREEN)
    const glow = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: color }, uOpacity: { value: 0.55 } },
      vertexShader: glowVertex,
      fragmentShader: glowFragment,
      transparent: true,
      depthWrite: false,
    })
    const grid = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: color }, uOpacity: { value: 0.45 }, uTime: { value: 0 } },
      vertexShader: gridVertex,
      fragmentShader: gridFragment,
      transparent: true,
      depthWrite: false,
    })
    const core = new THREE.MeshBasicMaterial({ color: '#c8ffd9', transparent: true, toneMapped: false })
    const beams = BEAMS.map(beamTransform)
    const coreGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 8)
    const glowGeo = new THREE.CylinderGeometry(0.16, 0.16, 1, 24, 1, true)
    const gridGeo = new THREE.PlaneGeometry(24, 24)
    return { glow, grid, core, beams, coreGeo, glowGeo, gridGeo }
  }, [])

  useEffect(
    () => () => [kit.glow, kit.grid, kit.core, kit.coreGeo, kit.glowGeo, kit.gridGeo].forEach((x) => x.dispose()),
    [kit],
  )

  useFrame((state) => {
    const visible = 1 - THREE.MathUtils.smoothstep(fade.current, 0.05, 0.6)
    kit.glow.uniforms.uOpacity.value = 0.55 * visible
    kit.grid.uniforms.uOpacity.value = 0.45 * visible
    kit.grid.uniforms.uTime.value = state.clock.elapsedTime
    kit.core.opacity = visible
  })

  return (
    <group>
      {kit.beams.map((b, i) => (
        <group key={i} position={b.position} quaternion={b.quaternion} scale={[1, b.length, 1]}>
          <mesh geometry={kit.coreGeo} material={kit.core} />
          <mesh geometry={kit.glowGeo} material={kit.glow} />
        </group>
      ))}
      <mesh geometry={kit.gridGeo} material={kit.grid} rotation-x={-Math.PI / 2} position={[0, floorY, 0]} />
    </group>
  )
}
