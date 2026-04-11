import { templateCompilerOptions } from '@tresjs/core';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
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

    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
    },

    server: {
      host: true,
      port: 24121,
      open: true,
    },

    build: {
      emptyOutDir: true,
      chunkSizeWarningLimit: 1500,

      rolldownOptions: {
        experimental: {
          lazyBarrel: true,
          nativeMagicString: true,
        },

        output: {
          minify: isProd
            ? {
                compress: {
                  dropConsole: true,
                  dropDebugger: true,
                },
              }
            : true,

          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },

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
        '@tanstack/vue-virtual',
      ],
    },
  };
});
