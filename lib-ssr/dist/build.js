import { build } from 'esbuild';
import { resolve } from 'path';
import { outDir } from './constants.js';
import { readFileSync, writeFileSync } from 'fs';
import { runAdapter } from './adapters/adapters.js';
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
    outfile: outDir + '/main.js',
    format: 'esm'
});
const createElementFn = `const createElement = createElementSSR;
`;
const codePath = resolve(cwd, outDir, 'main.js');
let code = readFileSync(codePath, 'utf-8');
code = createElementFn + code;
writeFileSync(codePath, code);
await runAdapter();
