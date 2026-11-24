import { readFileSync } from 'node:fs'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'
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

// Emit .gz and .br next to each text asset so a static host can serve pre-compressed bytes.
// The bundle is already minified (identifiers mangled) by Vite's default build minifier.
const COMPRESS_RE = /\.(js|css|html|svg|json)$/
const COMPRESS_MIN_BYTES = 1024

function compressAssets() {
  return {
    name: 'compress-assets',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const [name, output] of Object.entries(bundle)) {
        if (!COMPRESS_RE.test(name)) continue
        const source = output.type === 'asset' ? output.source : output.code
        const buffer = Buffer.from(source)
        if (buffer.length < COMPRESS_MIN_BYTES) continue
        this.emitFile({ type: 'asset', fileName: `${name}.gz`, source: gzipSync(buffer, { level: 9 }) })
        this.emitFile({
          type: 'asset',
          fileName: `${name}.br`,
          source: brotliCompressSync(buffer, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }),
        })
      }
    },
  }
}

// Reached only through lazy() in apps. Without listing them, the dev server finds them
// mid-session, re-bundles, and in-flight requests fail with 504 "Outdated Optimize Dep".
const LAZY_DEPS = [
  'three',
  'three/examples/jsm/environments/RoomEnvironment.js',
  'three/examples/jsm/loaders/GLTFLoader.js',
  'three/examples/jsm/misc/GPUComputationRenderer.js',
  '@react-three/fiber',
  '@react-three/drei',
  '@react-three/postprocessing',
  'postprocessing',
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
    plugins: [react(), fileProtocolBuild(models), compressAssets()],
    // relative URLs so dist/ works from any subpath (GitHub Pages) and from file://
    base: './',
    build: {
      modulePreload: false,
      // mangles identifiers and strips whitespace/comments; default minifier, stated for intent
      minify: true,
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
