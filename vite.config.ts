/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig, splitVendorChunk } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs-extra';
import moment from 'moment';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import vitePluginCompression from 'vite-plugin-compression';
import compressing from 'compressing';

const getVendorChunk = splitVendorChunk();

const plugins = [vue()];
if (process.env.NODE_ENV === 'production') {
  plugins.push(visualizer({ open: false, filename: 'dist/visualizer.stats.html' }) as any);
  // gzip
  plugins.push(vitePluginCompression({
    filter: (file) => !file.includes('eorzea-map') && /\.(js|mjs|json|css|html)$/.test(file),
    success: () => {
      // zip dist assets
      compressing.zip.compressDir(
        path.resolve(__dirname, 'dist/ffxiv-9card-assets'),
        path.resolve(__dirname, 'dist/ffxiv-9card-assets.zip'),
      ).then(() => {
        console.log('compress completed');
      }).catch((err) => {
        console.error(err);
      });
    },
  }));
  // eorzea map copy to dist
  plugins.push(viteStaticCopy({
    targets: [{
      src: 'eorzea-map/index.html',
      dest: 'eorzea-map',
    }, {
      src: 'eorzea-map/online.html',
      dest: 'eorzea-map',
    }, {
      src: 'eorzea-map/static',
      dest: 'eorzea-map',
    }, {
      src: 'dist/ffxiv.9card.version',
      dest: '',
    }],
  }) as any);
  // version tag
  const versionPlugin = () => ({
    name: 'ffxiv-9card-version-plugin',
    buildStart() {
      const version = `CN-6.15-${moment().format('YYYYMMDDhhmmss')}`;
      fs.writeFileSync(path.resolve(__dirname, 'dist/ffxiv.9card.version'), version);
    },
  });
  plugins.push(versionPlugin());
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    minify: 'terser',
    outDir: 'dist/ffxiv-9card-assets',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id: any, options) {
          if (id.includes('node_modules') && id.includes('naive-ui')) {
            return 'ui';
          }
          if (id.includes('src')) {
            const matchJson = /\.(json)$/;
            if (matchJson.test(id)) {
              return 'resources';
            }
            return 'ffxiv-9card';
          }
          return getVendorChunk(id, options);
        },
      },
    },
  },
  plugins,
  server: {
    port: 23001,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
});
