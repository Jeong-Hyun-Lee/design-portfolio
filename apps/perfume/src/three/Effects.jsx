import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { focusPoint } from './Bottle.jsx'
import { lightness, rig } from '../rig.js'

const BOKEH_MAX = 3.5
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
  const offset = useMemo(() => new THREE.Vector2(0.0006, 0.0004), [])

  useFrame(() => {
    const light = lightness(rig.stage)
    const rush = isReducedMotion ? 0 : Math.min(1, Math.abs(rig.velocity) / RUSH_PX_S)
    const strength = (0.0006 + rush * 0.0035) * (1 - light * 0.75)
    fringe.current?.offset.set(strength, strength * 0.6)
    if (vignette.current) vignette.current.darkness = 0.6 * (1 - light)
    if (lens.current) {
      lens.current.target.copy(focusPoint)
      lens.current.bokehScale = rig.explode * BOKEH_MAX
    }
  })

  return (
    <EffectComposer multisampling={isLite ? 0 : 4}>
      {!isLite && <DepthOfField ref={lens} target={[0, 0, 0]} worldFocusRange={1.1} bokehScale={0} />}
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.85} radius={0.75} />
      <ChromaticAberration ref={fringe} offset={offset} radialModulation modulationOffset={0.15} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.1} />
      <Vignette ref={vignette} offset={0.28} darkness={0.6} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  )
}
