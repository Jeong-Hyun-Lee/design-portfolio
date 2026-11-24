import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { focusPoint } from './Bottle.jsx'
import { lightness, rig } from '../rig.js'

const BOKEH_MAX = 3.5
const BLOOM = 0.85
const RUSH_PX_S = 2500 // scroll speed at which the lens fringing peaks

/**
 * Post stack. Bloom only catches HDR (>1) light, so the light walls never glow; chromatic
 * aberration swells with scroll speed; depth of field racks focus between the exploded parts.
 * Neutral tone mapping keeps the DESIGN.md wall colours close to their hex values.
 */
export default function Effects({ isLite, isReducedMotion }) {
  const fringe = useRef(null)
  const vignette = useRef(null)
  const lens = useRef(null)
  const bloom = useRef(null)
  const offset = useMemo(() => new THREE.Vector2(0.0006, 0.0004), [])

  useFrame(() => {
    const light = lightness(rig.stage)
    const rush = isReducedMotion ? 0 : Math.min(1, Math.abs(rig.velocity) / RUSH_PX_S)
    const strength = (0.0006 + rush * 0.0035) * (1 - light * 0.75)
    fringe.current?.offset.set(strength, strength * 0.6)
    if (vignette.current) vignette.current.darkness = 0.6 * (1 - light)
    // the closing mark is polished metal, not neon: let its highlights stay crisp
    if (bloom.current) bloom.current.intensity = BLOOM * (1 - 0.8 * Math.min(1, Math.max(0, rig.stage - 3)))
    if (lens.current) {
      lens.current.target.copy(focusPoint)
      lens.current.bokehScale = rig.explode * BOKEH_MAX
    }
  })

  return (
    <EffectComposer multisampling={isLite ? 0 : 4}>
      {!isLite && <DepthOfField ref={lens} target={[0, 0, 0]} worldFocusRange={1.1} bokehScale={0} />}
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={BLOOM} radius={0.75} />
      <ChromaticAberration ref={fringe} offset={offset} radialModulation modulationOffset={0.15} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.1} />
      <Vignette ref={vignette} offset={0.28} darkness={0.6} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  )
}
