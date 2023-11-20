import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: 'index.js'
      }
    },
    minify: false
  },
  esbuild: {
    jsxFactory: 'createElement',
    jsxFragment: 'Fragment',
    jsxInject: 'import { createElement, Fragment } from "@jacksonotto/lampjs"'
  }
});
