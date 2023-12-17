import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { outDir } from './constants.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const cwd = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const ref = args[1];

if (ref) {
  const refPath = resolve(__dirname, '../', 'refs', ref + '.json');
  const exists = existsSync(refPath);

  if (exists) {
    const data = JSON.parse(readFileSync(refPath, 'utf-8'));
    const path = resolve(cwd, data.path);

    const dirPath = dirname(path);
    const dirExists = existsSync(dirPath);

    if (!dirExists) {
      mkdirSync(dirPath);
    }

    writeFileSync(path, data.code);
  }
}

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
