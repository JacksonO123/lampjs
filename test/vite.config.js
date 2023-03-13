import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080,
    open: true
  },
  esbuild: {
    jsxFactory: 'LiquidJs.createElement',
    jsxFragment: 'Fragment',
    jsxInject: 'import LiquidJs from "liquidjs"'
  }
});
