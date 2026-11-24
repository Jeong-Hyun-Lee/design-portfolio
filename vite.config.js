import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const MODEL = 'models/lantern.glb'

/**
 * Lets dist/index.html run from file:// (double-click), where Chrome blocks module scripts,
 * crossorigin stylesheets and fetch():
 * - the app ships as one classic deferred script instead of ES module chunks;
 * - the GLB is also emitted as a script that defines window.__lanternGlb (base64),
 *   which LanternScene loads only on file://.
 */
function fileProtocolBuild() {
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
      const base64 = readFileSync(`public/${MODEL}`).toString('base64')
      this.emitFile({ type: 'asset', fileName: `${MODEL}.js`, source: `window.__lanternGlb="${base64}";` })
    },
  }
}

export default defineConfig({
  plugins: [react(), fileProtocolBuild()],
  // relative URLs so dist/ works from any subpath (e.g. GitHub Pages /design-portfolio/) and file://
  base: './',
  build: {
    modulePreload: false,
    // ponytail: one ~1.3 MB bundle (three.js included) because file:// can't load chunks;
    // split builds per target if the hosted page's first load matters more than double-click
    chunkSizeWarningLimit: 1600,
    rolldownOptions: {
      output: { format: 'iife', codeSplitting: false },
    },
  },
  optimizeDeps: {
    // These are only reached through lazy() imports. Without listing them, Vite finds them
    // mid-session, re-bundles, and the in-flight chunk requests fail with 504 "Outdated Optimize Dep".
    include: [
      'three',
      'three/examples/jsm/environments/RoomEnvironment.js',
      'three/examples/jsm/loaders/GLTFLoader.js',
      '@react-three/fiber',
      '@react-three/drei',
      'gsap',
      'gsap/ScrollTrigger',
      '@gsap/react',
      'lenis',
    ],
  },
})
