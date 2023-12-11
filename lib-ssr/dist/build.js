import { build } from 'esbuild';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { outDir } from './constants.js';
const path = resolve(process.cwd(), 'src', 'main.tsx');
await build({
    jsxFactory: 'createElementSSR',
    jsxFragment: 'Fragment',
    entryPoints: [path],
    define: {
        'import.meta.env.SSR': 'true',
        'import.meta.env.DEV': 'false'
    },
    bundle: true,
    minify: true,
    outfile: outDir + '/main.js',
    format: 'esm',
    external: ['@jacksonotto/lampjs-ssr']
});
const createElementFn = `import { createElementSSR } from '@jacksonotto/lampjs-ssr';
const createElement = createElementSSR;\n`;
const codePath = resolve(process.cwd(), outDir, 'main.js');
let code = readFileSync(codePath, 'utf-8');
code = createElementFn + code;
writeFileSync(codePath, code);
