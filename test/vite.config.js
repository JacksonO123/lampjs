import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  esbuild: {
    jsxFactory: "LampJs.createElement",
    jsxFragment: "LampJs.Fragment",
    jsxInject: 'import LampJs from "@jacksonotto/lampjs"',
  },
});
