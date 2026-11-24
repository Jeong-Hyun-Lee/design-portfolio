import React from 'react' // default import: node (npm run check) can't name-import from React's CJS build
import { CAPS, ENGRAVING_MAX, SCENTS, VOLUMES } from './content.js'

// Configurator choices, read by both the DOM panel and the 3D bottle (two React trees).
let state = { scent: SCENTS[0].id, cap: CAPS[0].id, volume: 50, engraving: '' }
const listeners = new Set()

export function setConfig(patch) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export function useConfig() {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

/**
 * Engraving typed by the user: control characters dropped, whitespace collapsed, length capped.
 * It is only ever drawn to a canvas, never parsed as HTML.
 * @param {string} raw
 */
export function cleanEngraving(raw) {
  return Array.from(raw.replace(/[\p{C}]/gu, '').replace(/\s+/g, ' ').trimStart())
    .slice(0, ENGRAVING_MAX)
    .join('')
}

export const scentById = (id) => SCENTS.find((s) => s.id === id) ?? SCENTS[0]
export const priceOf = (ml) => VOLUMES.find((v) => v.ml === ml)?.price ?? VOLUMES[1].price
