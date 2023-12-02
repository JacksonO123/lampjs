import express from 'express';
import { toHtmlString, createElementSSR } from './lib.js';
import { createServer as createViteServer } from 'vite';
import { CacheType } from './types.js';
import { ComponentFactory } from '@jacksonotto/lampjs/types';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import chokidar from 'chokidar';
import mime from 'mime-types';

// @ts-ignore
if (!import.meta.env) import.meta.env = {};
import.meta.env.SSR = true;

const port = 3000;
const prod = process.argv[2] === 'prod';

globalThis.createElement = createElementSSR;

const cwd = process.cwd();
let App: ComponentFactory | null = null;
App = (await import(resolve(cwd, 'src', 'main.tsx'))).default as ComponentFactory;

const app = express();

function clearModuleCache(moduleName: string) {
  delete require.cache[require.resolve(moduleName)];
}

if (!prod) {
  const watcher = chokidar.watch(resolve(cwd, 'src'));
  let canWatch = false;

  setTimeout(() => {
    canWatch = true;
  }, 100);

  const handleFileChange = async () => {
    if (!canWatch) return;

    console.log('[lampjs:hmr] start');

    const moduleKeys = Object.keys(require.cache);
    const toClear = moduleKeys.filter((item) => item.startsWith(resolve(cwd, 'src')));

    toClear.forEach((item) => {
      clearModuleCache(item);
    });

    const moduleUrl = resolve(cwd, 'src', 'main.tsx');
    App = (await import(moduleUrl)).default;

    console.log('[lampjs:hmr] done');
  };

  watcher.on('add', handleFileChange);
  watcher.on('change', handleFileChange);

  const viteServer = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: true
    },
    appType: 'custom'
  });

  app.use(viteServer.middlewares);
}

const getStyleTags = () => {
  let res = '';
  const cwd = process.cwd();
  const files = readdirSync(resolve(cwd, 'dist', 'assets'));

  files.forEach((file) => {
    if (!file.endsWith('.css')) return;

    res += `<link rel="stylesheet" href="/assets/${file}">`;
  });

  return res;
};

app.use('*', async (req, res) => {
  const params: Record<string, string> = req.params;
  const url = params[0];

  if (prod) {
    const reg = new RegExp(/\..*$/);
    if (reg.test(url)) {
      const ext = url.split('.').at(-1) as string;
      const fileUrl = resolve(cwd, 'dist', url.slice(1));

      const exists = existsSync(fileUrl);

      if (exists) {
        const data = readFileSync(fileUrl);

        const type = mime.lookup(ext);

        res.status(200).set({ 'Content-Type': type }).end(data);
      } else {
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

  const promiseCache: CacheType = {};

  let html = '<!DOCTYPE html>' + (await toHtmlString(createElement(App, null), options, promiseCache));

  html = html.replace(
    '<!-- lampjs_cache_insert -->',
    `<script id="_LAMPJS_DATA_" type="application/json">${JSON.stringify(promiseCache)}</script>`
  );

  res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
});

app.listen(port);
