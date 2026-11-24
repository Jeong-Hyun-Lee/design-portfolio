// Bottle geometry as plain numbers (no three.js) so `npm run check` can verify it.
// Profiles are [radius, y] from bottom to top, turned on a lathe with FACETS sides.

export const FACETS = 8
// rotate the lathe half a facet so a flat face (not an edge) looks at the camera
export const FACET_TURN = Math.PI / FACETS

export const GLASS = [
  [0, -1],
  [0.5, -1],
  [0.6, -0.96],
  [0.63, -0.86],
  [0.63, 0.52],
  [0.6, 0.66],
  [0.5, 0.76],
  [0.3, 0.84],
  [0.2, 0.87],
  [0.19, 0.98],
  [0, 0.98],
]

// The juice: same octagon, inset by the glass wall (thick base like real crystal flacons).
export const LIQUID = [
  [0, -0.84],
  [0.44, -0.84],
  [0.47, -0.76],
  [0.47, 0.46],
  [0.43, 0.58],
  [0.33, 0.66],
  [0.12, 0.71],
  [0, 0.71],
]
export const LIQUID_Y = { min: LIQUID[0][1], max: LIQUID[LIQUID.length - 1][1] }
export const FILL = 0.82 // fraction of the liquid volume's height that is filled

export const COLLAR = { radius: 0.21, height: 0.08, y: 1.02 }
export const CAP = { radius: 0.31, height: 0.62, y: 1.37 }
export const TUBE = { radius: 0.012, height: 1.7, y: 0.05 }

// distance from the axis to the middle of a flat face; the label sits just outside it
export const APOTHEM = 0.63 * Math.cos(Math.PI / FACETS)
export const LABEL = { width: 0.42, height: 0.6, y: -0.2 }

/** Scale that keeps proportions while the volume changes (volume grows with the cube). */
export const volumeScale = (ml) => Math.cbrt(ml / 50)

/**
 * Exploded view: how far each part travels from its home at progress t (0..1).
 * @param {number} t
 * @returns {Record<'cap'|'collar'|'tube'|'glass'|'liquid'|'label', [number, number, number]>}
 */
export function explodeOffsets(t) {
  return {
    cap: [0, 1.0 * t, 0],
    collar: [0, 0.55 * t, 0],
    tube: [0, 0.25 * t, 0],
    glass: [0, 0, 0],
    liquid: [0, -1.05 * t, 0],
    label: [0, 0, 0.55 * t],
  }
}
