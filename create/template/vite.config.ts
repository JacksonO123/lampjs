import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import aliasConfig from "./aliases";

const aliases = Object.entries(aliasConfig).reduce(
  (acc, curr) => {
    acc[`@${curr[0]}`] = fileURLToPath(new URL(curr[1], import.meta.url));
    return acc;
  },
  { "@": fileURLToPath(new URL("./src", import.meta.url)) }
);

export default defineConfig({
  resolve: {
    alias: aliases,
  },
  esbuild: {
    jsxFactory: "createElement",
    jsxFragment: "Fragment",
    jsxInject: 'import { createElement, Fragment } from "@jacksonotto/lampjs"',
  },
});
