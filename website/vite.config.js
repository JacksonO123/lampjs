import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsxFactory: "LampJs.createElement",
    jsxFragment: "LampJs.Fragment",
    jsxInject: 'import LampJs from "@jacksonotto/lampjs"',
  },
});
