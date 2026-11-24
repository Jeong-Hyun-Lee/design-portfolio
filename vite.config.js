import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // These are only reached through lazy() imports. Without listing them, Vite finds them
    // mid-session, re-bundles, and the in-flight chunk requests fail with 504 "Outdated Optimize Dep".
    include: [
      'three',
      'three/examples/jsm/environments/RoomEnvironment.js',
      '@react-three/fiber',
      '@react-three/drei',
      'gsap',
      'gsap/ScrollTrigger',
      '@gsap/react',
      'lenis',
    ],
  },
})
