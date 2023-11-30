import express from 'express';
import { toHtmlString, createElementSSR } from './lib.js';
import { createServer as createViteServer } from 'vite';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import chokidar from 'chokidar';
const getStyleTags = () => {
    let res = '';
    const cwd = process.cwd();
    const files = readdirSync(resolve(cwd, 'dist', 'assets'));
    files.forEach((file) => {
        if (!file.endsWith('.css'))
            return;
        res += `<link rel="stylesheet" href="/assets/${file}">`;
    });
    return res;
};
function clearModuleCache(moduleName) {
    delete require.cache[require.resolve(moduleName)];
}
export const startServer = async (prod, port = 3000) => {
    // @ts-ignore
    if (!import.meta.env)
        import.meta.env = {};
    import.meta.env.SSR = true;
    globalThis.createElement = createElementSSR;
    const cwd = process.cwd();
    let App = (await import(cwd + '/src/main')).default;
    const watcher = chokidar.watch(resolve(cwd, 'src'));
    let canWatch = false;
    setTimeout(() => {
        canWatch = true;
    }, 100);
    const handleFileChange = async (path) => {
        if (!canWatch)
            return;
        const moduleUrl = resolve(cwd, 'src', 'main.tsx');
        clearModuleCache(path);
        clearModuleCache(moduleUrl);
        App = (await import(resolve(moduleUrl))).default;
    };
    watcher.on('add', handleFileChange);
    watcher.on('change', handleFileChange);
    const app = express();
    const viteServer = await createViteServer({
        server: {
            middlewareMode: true,
            hmr: true
        },
        appType: 'custom'
    });
    app.use(viteServer.middlewares);
    app.use('*', async (req, res) => {
        const params = req.params;
        const url = params[0];
        const contentTypes = {
            js: 'application/javascript',
            css: 'text/css',
            txt: 'text'
        };
        if (prod) {
            const reg = new RegExp(/\..*$/);
            if (reg.test(url)) {
                const ext = url.split('.').at(-1);
                const fileUrl = resolve(cwd, 'dist', url.slice(1));
                const exists = existsSync(fileUrl);
                if (exists) {
                    const data = readFileSync(fileUrl);
                    res
                        .status(200)
                        .set({ 'Content-Type': contentTypes[ext] || 'text' })
                        .end(data);
                }
                else {
                    res.status(404).end('404 page not found');
                }
            }
        }
        const clientJs = prod
            ? '<script type="module" src="/index.js"></script>'
            : '<script type="module" src="./src/main.tsx"></script>';
        const viteJs = prod ? '' : '<script type="module" src="/@vite/client"></script>';
        const styleTags = prod ? getStyleTags() : '';
        const options = {
            headInject: clientJs + viteJs + styleTags,
            route: url
        };
        const promiseCache = {};
        let html = '<!DOCTYPE html>' + (await toHtmlString(createElement(App, null), options, promiseCache));
        html = html.replace('<!-- lampjs_cache_insert -->', `<script id="_LAMPJS_DATA_" type="application/json">${JSON.stringify(promiseCache)}</script>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    });
    app.listen(port);
};
