import { mkdirSync, writeFileSync, copyFileSync, readFileSync, cpSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { normalizePath } from 'vite';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
const vcConfigJson = {
    handler: 'api/index.js',
    runtime: 'nodejs18.x',
    environment: {},
    launcherType: 'Nodejs',
    shouldAddHelpers: true,
    shouldAddSourcemapSupport: false,
    awsLambdaHandler: ''
};
export const vercelBuild = async () => {
    const cwd = pathToFileURL(normalizePath(process.cwd()) + '/');
    const serverCodeUrl = new URL('./node_modules/@jacksonotto/lampjs-ssr/dist/refs/vercel.js', cwd);
    const serverCode = readFileSync(fileURLToPath(serverCodeUrl), 'utf-8');
    const vercelOutputDir = new URL('../output/', cwd);
    const renderFuncUrl = new URL('./functions/index.func/', vercelOutputDir);
    const apiUrl = new URL('./api/index.js', renderFuncUrl);
    mkdirSync(new URL('./api/', renderFuncUrl), { recursive: true });
    writeFileSync(new URL('./.vc-config.json', renderFuncUrl), JSON.stringify(vcConfigJson));
    copyFileSync(new URL('./package.json', cwd), new URL('./package.json', renderFuncUrl));
    const bundledFile = fileURLToPath(new URL('./api.js', cwd));
    writeFileSync(bundledFile, serverCode);
    const bundle = await rollup({
        input: bundledFile,
        plugins: [
            nodeResolve({
                preferBuiltins: true,
                exportConditions: ['node']
            })
        ]
    });
    await bundle.write({
        format: 'esm',
        file: bundledFile,
        exports: 'auto',
        inlineDynamicImports: true
    });
    await bundle.close();
    copyFileSync(bundledFile, fileURLToPath(apiUrl));
    cpSync(new URL('./dist', cwd), new URL('./dist', renderFuncUrl), {
        recursive: true
    });
    cpSync(new URL('./dist-ssr', cwd), new URL('./dist-ssr', renderFuncUrl), {
        recursive: true
    });
};
