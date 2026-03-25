import { defineConfig } from 'vite';
import Font from 'vite-plugin-font';

export default defineConfig({
  plugins: [Font.vite()],
  base: '/Lin/',

  server: {
    host: true,
    port: 24121,
    open: true,
  },

  build: {
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('howler')) return 'vendor-howler';
            if (id.includes('marked')) return 'vendor-marked';
            if (id.includes('dompurify')) return 'vendor-dompurify';
            if (id.includes('roughjs')) return 'vendor-roughjs';
            if (id.includes('dayjs')) return 'vendor-dayjs';
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },

  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },

  optimizeDeps: {
    include: ['three', 'howler', 'marked', 'dompurify', 'roughjs', 'dayjs'],
  },
});
