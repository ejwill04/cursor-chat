/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import path from 'path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

interface VitestConfigExport extends UserConfig {
  test: {
    environment: string
    globals: boolean
    coverage: {
      provider: string
      reporter: string[]
    }
  }
}

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
} as VitestConfigExport) 