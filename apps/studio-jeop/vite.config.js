import { defineConfig } from 'vite'
import { defineStaticSite } from '@portfolio/shared/vite'

export default defineConfig(defineStaticSite({ models: ['models/lantern.glb'] }))
