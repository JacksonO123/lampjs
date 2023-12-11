import { build } from 'esbuild';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
const path = resolve(process.cwd(), 'src', 'main.tsx');
await build({
    jsxFactory: 'createElementSSR',
    jsxFragment: 'Fragment',
    entryPoints: [path],
    define: {
        'import.meta.env.SSR': 'true',
        // 'import.meta.env.DEV': 'false'
        'import.meta.env.DEV': 'true'
    },
    bundle: true,
    minify: true,
    outfile: 'ssr-dist/main.js',
    format: 'esm',
    external: ['@jacksonotto/lampjs-ssr']
});
const createElementFn = `import { createElementSSR } from '@jacksonotto/lampjs-ssr';
const createElement = createElementSSR;\n`;
const codePath = resolve(process.cwd(), 'ssr-dist', 'main.js');
let code = readFileSync(codePath, 'utf-8');
code = createElementFn + code;
writeFileSync(codePath, code);
