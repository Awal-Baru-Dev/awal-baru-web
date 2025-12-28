import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    netlify(),
  ],
  environments: {
    client: {
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Split large vendor dependencies (client-only)
              'vendor-react': ['react', 'react-dom'],
              'vendor-router': ['@tanstack/react-router'],
              'vendor-query': ['@tanstack/react-query'],
              'vendor-supabase': ['@supabase/supabase-js', '@supabase/ssr'],
              'vendor-ui': ['@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-accordion', '@radix-ui/react-slot'],
            },
          },
        },
      },
    },
  },
})

export default config
