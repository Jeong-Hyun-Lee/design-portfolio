import { defineConfig } from 'vite'
import { defineStaticSite } from '@portfolio/shared/vite'

// The 3D room is built from primitives in src/three, so no GLB needs registering here.
export default defineConfig(defineStaticSite())
