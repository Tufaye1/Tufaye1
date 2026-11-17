import { defineConfig } from 'vite'

export default defineConfig({
  // Relative asset paths so the build works from any host or sub-folder.
  base: './',
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 800,
  },
})
