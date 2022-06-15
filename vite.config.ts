import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import rollupPluginVisualizer from 'rollup-plugin-visualizer';
// import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    // rollupOptions: {
    //   output: {
    //     manualChunks(id: string) {
    //       if (id.includes('node_modules')) {
    //         if (id.includes('vue')) {
    //           return 'vue';
    //         }
    //         if (id.includes('naive-ui') || id.includes('vfonts')) {
    //           return 'ui';
    //         }
    //         return 'vendor';
    //       }
    //       return 'index';
    //     },
    //   },
    // },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  plugins: [
    vue(),
    rollupPluginVisualizer({
      open: false,
    }),
    // viteCompression(),
  ],
  server: {
    port: 23001,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
});
