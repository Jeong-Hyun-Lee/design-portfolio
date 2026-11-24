import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import { makeTargets } from './noteShapes.js'
import { noteBlend, particleOpacity, rig } from '../rig.js'

// GPGPU particles: positions live in a float texture that a fragment shader integrates every
// frame (ping-pong render targets via three's GPUComputationRenderer). Each particle eases
// toward a blend of four target shapes, drifts on curl noise and is pushed away by the pointer.

const NOISE = /* glsl */ `
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  vec3 snoiseVec3(vec3 x) {
    return vec3(snoise(x), snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)), snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4)));
  }
  // divergence-free flow: particles swirl instead of bunching up
  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    vec3 px0 = snoiseVec3(p - dx); vec3 px1 = snoiseVec3(p + dx);
    vec3 py0 = snoiseVec3(p - dy); vec3 py1 = snoiseVec3(p + dy);
    vec3 pz0 = snoiseVec3(p - dz); vec3 pz1 = snoiseVec3(p + dz);
    float x = py1.z - py0.z - pz1.y + pz0.y;
    float y = pz1.x - pz0.x - px1.z + px0.z;
    float z = px1.y - px0.y - py1.x + py0.x;
    return normalize(vec3(x, y, z) / (2.0 * e));
  }
`

const SIMULATION = /* glsl */ `
  uniform float uTime;
  uniform float uDelta;
  uniform float uBlend;
  uniform float uFlow;
  uniform vec3 uPointer;
  uniform sampler2D tCloud;
  uniform sampler2D tTop;
  uniform sampler2D tMiddle;
  uniform sampler2D tBase;
  ${NOISE}
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 current = texture2D(tPosition, uv);
    vec4 cloud = texture2D(tCloud, uv);
    vec3 a = cloud.xyz;
    vec3 b = texture2D(tTop, uv).xyz;
    vec3 c = texture2D(tMiddle, uv).xyz;
    vec3 d = texture2D(tBase, uv).xyz;
    vec3 target = uBlend < 1.0 ? mix(a, b, uBlend) : uBlend < 2.0 ? mix(b, c, uBlend - 1.0) : mix(c, d, min(uBlend - 2.0, 1.0));

    // each particle has its own pace (seed in w), so shapes assemble with a trailing shimmer
    float pace = mix(0.9, 3.2, cloud.w);
    vec3 pos = current.xyz;
    pos += (target - pos) * (1.0 - exp(-pace * uDelta));
    pos += curlNoise(pos * 0.55 + uTime * 0.06) * uDelta * 0.18 * uFlow;
    vec3 away = pos - uPointer;
    pos += normalize(away + 1e-4) * uDelta * 2.2 * exp(-dot(away, away) * 2.5);
    gl_FragColor = vec4(pos, current.w);
  }
`

const POINTS_VERTEX = /* glsl */ `
  uniform sampler2D tPosition;
  uniform float uSize;
  uniform float uTime;
  attribute vec2 reference;
  varying float vSeed;
  varying float vFade;
  void main() {
    vec4 p = texture2D(tPosition, reference);
    vec4 mv = modelViewMatrix * vec4(p.xyz, 1.0);
    // particles behind or inside the bottle get smeared into haze by the glass: dim them.
    // Done in view space because the whole group spins with the bottle.
    vec4 bottle = modelViewMatrix * vec4(0.0, 0.1, 0.0, 1.0);
    float behind = step(mv.z, bottle.z + 0.3);
    vFade = 1.0 - 0.85 * behind * smoothstep(0.75, 0.35, length(mv.xy - bottle.xy));
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.55 + 0.45 * sin(uTime * 2.3 + p.w * 60.0);
    gl_PointSize = uSize * (0.35 + p.w) * twinkle / -mv.z;
    vSeed = p.w;
  }
`

const POINTS_FRAGMENT = /* glsl */ `
  uniform vec3 uTint;
  uniform float uOpacity;
  varying float vSeed;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a * vFade;
    // HDR (>1) so the brightest glints cross the bloom threshold
    vec3 color = mix(vec3(1.0, 0.98, 0.94), uTint, vSeed * 0.7) * 1.3;
    gl_FragColor = vec4(color * a * uOpacity, a * uOpacity);
  }
`

const POINT_SIZE = 26 // at 900 css px of canvas height, dpr 1

function dataTexture(data, size) {
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
  texture.needsUpdate = true
  return texture
}

/** Builds the simulation; throws (caught by SceneBoundary) if the GPU cannot render to floats. */
function createSimulation(gl, size, targets) {
  const gpu = new GPUComputationRenderer(size, size, gl)
  // half floats render on every WebGL2 device; full float targets are missing on some phones
  gpu.setDataType(THREE.HalfFloatType)
  const start = gpu.createTexture()
  start.image.data.set(targets.cloud)
  const variable = gpu.addVariable('tPosition', SIMULATION, start)
  gpu.setVariableDependencies(variable, [variable])
  Object.assign(variable.material.uniforms, {
    uTime: { value: 0 },
    uDelta: { value: 0 },
    uBlend: { value: 0 },
    uFlow: { value: 1 },
    uPointer: { value: new THREE.Vector3(99, 99, 99) },
    tCloud: { value: dataTexture(targets.cloud, size) },
    tTop: { value: dataTexture(targets.top, size) },
    tMiddle: { value: dataTexture(targets.middle, size) },
    tBase: { value: dataTexture(targets.base, size) },
  })
  const error = gpu.init()
  if (error) throw new Error(`particle simulation: ${error}`)
  return { gpu, variable }
}

function pointsGeometry(size) {
  const count = size * size
  const reference = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    reference[i * 2] = ((i % size) + 0.5) / size
    reference[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('reference', new THREE.BufferAttribute(reference, 2))
  return g
}

/** @param {{ size: number, isReducedMotion: boolean }} props size*size particles */
export default function NoteParticles({ size, isReducedMotion }) {
  const gl = useThree((s) => s.gl)
  const points = useRef(null)
  const pointer = useMemo(() => new THREE.Vector3(), [])

  const sim = useMemo(() => createSimulation(gl, size, makeTargets(size * size)), [gl, size])
  useEffect(
    () => () => {
      Object.values(sim.variable.material.uniforms).forEach((u) => u.value?.isTexture && u.value.dispose())
      sim.gpu.dispose()
    },
    [sim],
  )

  const geometry = useMemo(() => pointsGeometry(size), [size])
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: POINTS_VERTEX,
        fragmentShader: POINTS_FRAGMENT,
        uniforms: {
          tPosition: { value: null },
          uSize: { value: POINT_SIZE },
          uTime: { value: 0 },
          uTint: { value: new THREE.Color('#ffc98f') },
          uOpacity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  useFrame((state, delta) => {
    const opacity = particleOpacity(rig.stage)
    material.uniforms.uOpacity.value = opacity
    points.current.visible = opacity > 0.01
    if (!points.current.visible) return // nothing to see: skip the simulation pass entirely

    const u = sim.variable.material.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uDelta.value = Math.min(delta, 1 / 30)
    u.uBlend.value = noteBlend(rig.stage, rig.notes)
    u.uFlow.value = isReducedMotion ? 0.2 : 1
    // pointer on the z=0 plane of the viewport, then into this group's space
    pointer.set((state.pointer.x * state.viewport.width) / 2, (state.pointer.y * state.viewport.height) / 2, 0)
    u.uPointer.value.copy(points.current.worldToLocal(pointer))
    sim.gpu.compute()

    material.uniforms.tPosition.value = sim.gpu.getCurrentRenderTarget(sim.variable).texture
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uSize.value = POINT_SIZE * state.viewport.dpr * (state.size.height / 900)
  })

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
}
