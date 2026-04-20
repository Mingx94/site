import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { editorContentApi } from './vite-plugin-content-api';

const SITE_ROOT = resolve(__dirname, '..');
const SITE_SRC = resolve(SITE_ROOT, 'src');
const SITE_CONTENT = resolve(SITE_SRC, 'content');

export default defineConfig({
  server: {
    fs: { allow: [SITE_ROOT, __dirname] },
  },
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $components: resolve(__dirname, 'src/components'),
      $preview: resolve(__dirname, 'src/preview'),
      $state: resolve(__dirname, 'src/lib/state'),
      '@': SITE_SRC,
      $content: SITE_CONTENT,
      '$app/state': resolve(__dirname, 'src/lib/sveltekit-shim/state.svelte.ts'),
    },
  },
  plugins: [
    enhancedImages(),
    tailwindcss(),
    svelte(),
    editorContentApi({ root: SITE_CONTENT }),
  ],
  optimizeDeps: {
    include: ['mdsvex', 'svelte/compiler', 'bits-ui'],
  },
});
