import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const nodeExternals = [
  'electron', 'electron-store', 'fs', 'path', 'os', 'crypto',
  'events', 'stream', 'util', 'url', 'http', 'https', 'net',
  'tls', 'zlib', 'child_process', 'buffer', 'assert', 'module'
]

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/main.ts') },
        external: nodeExternals,
        output: { format: 'cjs', entryFileNames: '[name].js' }
      }
    },
    resolve: {
      alias: { '@shared': resolve('src/shared') }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload.ts'),
          player: resolve(__dirname, 'electron/preload-player.ts')
        },
        external: nodeExternals,
        output: { format: 'cjs', entryFileNames: '[name].js' }
      }
    },
    resolve: {
      alias: { '@shared': resolve('src/shared') }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src'),
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@dm': resolve('src/dm'),
        '@player': resolve('src/player')
      }
    },
    build: {
      rollupOptions: {
        input: {
          dm: resolve(__dirname, 'src/dm/index.html'),
          player: resolve(__dirname, 'src/player/index.html')
        }
      }
    }
  }
})
