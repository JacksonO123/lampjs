import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  esbuild: {
    jsxFactory: "LampJs.createElement",
    jsxFragment: "LampJs.Fragment",
    jsxInject: 'import LampJs from "@jacksonotto/lampjs"',
  },
});
