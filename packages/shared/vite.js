import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'

/**
 * Lets dist/index.html run from file:// (double-click), where Chrome blocks module scripts,
 * crossorigin stylesheets and fetch():
 * - the app ships as one classic deferred script instead of ES module chunks;
 * - each GLB in `models` is also emitted as `<path>.js`, which registers its bytes as base64
 *   in window.__glb; loadGlb() uses that only on file://.
 * @param {string[]} models paths under the app's public/, e.g. 'models/lantern.glb'
 */
function fileProtocolBuild(models) {
  return {
    name: 'file-protocol-build',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) =>
        html
          .replace(/<script type="module" crossorigin/g, '<script defer')
          .replace(/<link rel="stylesheet" crossorigin/g, '<link rel="stylesheet"'),
    },
    generateBundle() {
      models.forEach((path) => {
        const base64 = readFileSync(`public/${path}`).toString('base64')
        this.emitFile({
          type: 'asset',
          fileName: `${path}.js`,
          source: `(window.__glb||={})[${JSON.stringify(path)}]="${base64}";`,
        })
      })
    },
  }
}

// Reached only through lazy() in apps. Without listing them, the dev server finds them
// mid-session, re-bundles, and in-flight requests fail with 504 "Outdated Optimize Dep".
const LAZY_DEPS = [
  'three',
  'three/examples/jsm/environments/RoomEnvironment.js',
  'three/examples/jsm/loaders/GLTFLoader.js',
  '@react-three/fiber',
  '@react-three/drei',
  'gsap',
  'gsap/ScrollTrigger',
  '@gsap/react',
  'lenis',
]

/**
 * Vite config shared by every portfolio app.
 * @param {{ models?: string[] }} [options]
 */
export function defineStaticSite({ models = [] } = {}) {
  return {
    plugins: [react(), fileProtocolBuild(models)],
    // relative URLs so dist/ works from any subpath (GitHub Pages) and from file://
    base: './',
    build: {
      modulePreload: false,
      // ponytail: one bundle (three.js included) because file:// can't load chunks;
      // split builds per target if the hosted page's first load matters more than double-click
      chunkSizeWarningLimit: 1600,
      rolldownOptions: {
        output: { format: 'iife', codeSplitting: false },
      },
    },
    optimizeDeps: { include: LAZY_DEPS },
  }
}
