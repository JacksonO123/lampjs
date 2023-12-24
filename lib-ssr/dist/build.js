import { build } from 'esbuild';
import { resolve } from 'path';
import { outDir } from './constants.js';
import { readFileSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';
const cwd = process.cwd();
const path = resolve(cwd, 'src', 'main.tsx');
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
const createElementFn = `import { createElementSSR } from '@jacksonotto/lampjs-ssr';const createElement = createElementSSR;`;
const codePath = resolve(cwd, outDir, 'main.js');
let code = readFileSync(codePath, 'utf-8');
code = createElementFn + code;
writeFileSync(codePath, code);
const child = spawn('npx', ['rollup', 'dist-ssr/main.js', '-o', 'dist-ssr/main.js']);
child.stderr.on('data', (data) => {
    console.log(data + '');
});
