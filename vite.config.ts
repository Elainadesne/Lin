import { defineConfig, ESBuildOptions } from 'vite';
import Font from 'vite-plugin-font';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
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
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('three')) return 'vendor-three';
              if (id.includes('howler')) return 'vendor-howler';
              if (id.includes('marked')) return 'vendor-marked';
              if (id.includes('dompurify')) return 'vendor-dompurify';
              if (id.includes('roughjs')) return 'vendor-roughjs';
              if (id.includes('dayjs')) return 'vendor-dayjs';
              if (id.includes('flatpickr')) return 'vendor-flatpickr';
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },

    esbuild: (isProd ? { drop: ['console', 'debugger'] } : undefined) as ESBuildOptions | undefined,

    optimizeDeps: {
      include: ['three', 'howler', 'marked', 'dompurify', 'roughjs', 'dayjs', 'flatpickr'],
    },
  };
});
