import { defineConfig } from 'vitest/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const localPreactHA = path.resolve(dirname, '../preact-homeassistant');
const hasLocalPreactHA = fs.existsSync(path.join(localPreactHA, 'package.json'));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__test-utils__/setup.ts'],
    server: {
      deps: {
        // Vitest can't resolve Vite-specific suffixes like ?inline for leaflet's CSS.
        inline: [/leaflet/],
      },
    },
  },
  resolve: {
    alias: [
      ...(hasLocalPreactHA
        ? [{ find: /^preact-homeassistant$/, replacement: localPreactHA }]
        : []),
      // Strip Vite asset suffixes for tests
      { find: /^(.*)\?inline$/, replacement: '$1' },
      { find: /^(.*\.png)$/, replacement: '$1' },
    ],
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
});
