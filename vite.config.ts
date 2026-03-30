import { templateCompilerOptions } from '@tresjs/core';
import vue from '@vitejs/plugin-vue';
import { defineConfig, ESBuildOptions } from 'vite';
import Font from 'vite-plugin-font';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      vue({
        ...templateCompilerOptions,
      }),
      Font.vite(),
    ],
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
              if (id.includes('vue')) return 'vendor-vue';
              if (id.includes('@vueuse')) return 'vendor-vueuse';
              if (id.includes('pinia')) return 'vendor-pinia';
              if (id.includes('three')) return 'vendor-three';
              if (id.includes('@tresjs')) return 'vendor-tresjs';
              if (id.includes('howler')) return 'vendor-howler';
              if (id.includes('marked')) return 'vendor-marked';
              if (id.includes('dompurify')) return 'vendor-dompurify';
              if (id.includes('roughjs')) return 'vendor-roughjs';
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
      include: [
        'vue',
        '@vueuse/core',
        'pinia',
        'three',
        '@tresjs/core',
        'howler',
        'marked',
        'dompurify',
        'roughjs',
        'flatpickr',
        'vue-flatpickr-component',
      ],
    },
  };
});
