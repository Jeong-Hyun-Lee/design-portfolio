import { defineConfig } from 'vite'
import { defineStaticSite } from '@portfolio/shared/vite'

// Every 3D asset (bottle, liquid, particles, wordmark) is built in code, so no GLB is listed.
export default defineConfig(defineStaticSite())
