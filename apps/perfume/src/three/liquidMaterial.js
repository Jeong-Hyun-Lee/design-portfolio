import * as THREE from 'three'

// The perfume inside the bottle. A surface plane (fill level, tilted by a damped spring in
// Bottle.jsx) cuts the volume: fragments above it are discarded, and the back faces that show
// through the cut are painted as the liquid's top. Classic "wobble" liquid, written by hand.

const vertexShader = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vLocal = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uFill;
  uniform vec2 uTilt;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float ripple = sin(vLocal.x * 7.0 + uTime * 2.1) * 0.006 + sin(vLocal.z * 9.0 - uTime * 1.7) * 0.004;
    float surface = uFill + vLocal.x * uTilt.x + vLocal.z * uTilt.y + ripple;
    if (vLocal.y > surface) discard;

    vec3 color;
    if (!gl_FrontFacing) {
      // the top of the liquid, seen through the cut: lighter, like a lit meniscus
      color = mix(uColor, vec3(1.0), 0.45);
    } else {
      float facing = max(dot(normalize(vNormal), vView), 0.0);
      float fresnel = pow(1.0 - facing, 3.0);
      float depth = clamp((surface - vLocal.y) / 1.4, 0.0, 1.0);
      color = mix(uColor * 0.85, uColor * 0.22, depth);
      color += fresnel * 0.25;
      color += smoothstep(0.035, 0.0, surface - vLocal.y) * 0.5; // bright rim at the surface
    }
    gl_FragColor = vec4(color, uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/** @param {number} fill local-space y of the resting surface */
export function createLiquidMaterial(fill) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color('#f3a37a') },
      uFill: { value: fill },
      uTilt: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uOpacity: { value: 0.6 },
    },
    side: THREE.DoubleSide,
    transparent: true,
  })
}
