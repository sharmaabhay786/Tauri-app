import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tauri from 'vite-plugin-tauri';

// eslint-disable-next-line no-undef
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  // prevent vite from obscuring rust errors
  clearScreen: false,
  server: {
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // if the host Tauri is expecting is set, use it
    host: host || false,
    port: 5173,
  },
  // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target:
      // eslint-disable-next-line no-undef
      process.env.TAURI_ENV_PLATFORM == 'windows'
        ? 'chrome105'
        : 'safari13',
    // don't minify for debug builds
    // eslint-disable-next-line no-undef
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    // eslint-disable-next-line no-undef
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    plugins: [react(), tauri()],
    
  },
});