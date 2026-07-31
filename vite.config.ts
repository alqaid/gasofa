import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    }, build: {
      rollupOptions: {
        output: {
          // Controla el nombre del archivo JavaScript principal
          entryFileNames: 'assets/[name]_v23.js',
          // Controla los archivos JavaScript secundarios (chunks)
          chunkFileNames: 'assets/[name]_v23.js',
          // Controla los archivos de CSS y assets (imágenes, fuentes)
          assetFileNames: 'assets/[name]_v23.[ext]'
        }
      }
    }
  };
});
