import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080,
    open: true
  },
  esbuild: {
    jsxFactory: 'LampJs.createElement',
    jsxFragment: 'Fragment',
    jsxInject: 'import LampJs from "lampjs"'
  }
});
