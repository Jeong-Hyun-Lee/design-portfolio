import { defineConfig } from 'vite'
import { defineStaticSite } from '@portfolio/shared/vite'

// List GLBs under public/ here so they also load from file:// (see loadGlb).
export default defineConfig(defineStaticSite({ models: [] }))
