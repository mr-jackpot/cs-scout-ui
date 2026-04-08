import { defineConfig, type Plugin } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const REQUIRED_ENV_VARS = [
  'VITE_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
]

function envValidator(): Plugin {
  return {
    name: 'env-validator',
    config(_, { command, mode }) {
      if (command !== 'build') return

      const env = loadEnv(mode, process.cwd(), 'VITE_')
      const missing = REQUIRED_ENV_VARS.filter(
        (key) => !env[key] && !process.env[key]
      )
      if (missing.length > 0) {
        throw new Error(
          `Missing required environment variables for production build:\n` +
            missing.map((v) => `  - ${v}`).join('\n') +
            `\nSet them in .env or as environment variables.`
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), envValidator()],
  server: {
    proxy: {
      '/players': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
