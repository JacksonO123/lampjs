import express from 'express';
import { toHtmlString, createElementSSR } from './lib.js';
import { createServer as createViteServer } from 'vite';
import { CacheType } from './types.js';
import { ComponentFactory } from '@jacksonotto/lampjs/types';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import chokidar from 'chokidar';

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

function clearModuleCache(moduleName: string) {
  delete require.cache[require.resolve(moduleName)];
}

export const startServer = async (prod: boolean, port = 3000) => {
  // @ts-ignore
  if (!import.meta.env) import.meta.env = {};
  import.meta.env.SSR = true;

  globalThis.createElement = createElementSSR;

  const cwd = process.cwd();
  let App = (await import(cwd + '/src/main')).default as ComponentFactory;
  const watcher = chokidar.watch(resolve(cwd, 'src'));
  let canWatch = false;

  setTimeout(() => {
    canWatch = true;
  }, 100);

  const thing = async (path: string) => {
    if (!canWatch) return;

    const moduleUrl = resolve(cwd, 'src', 'main.tsx');
    clearModuleCache(path);
    clearModuleCache(moduleUrl);
    App = (await import(resolve(moduleUrl))).default;
  };

  watcher.on('add', thing);
  watcher.on('change', thing);

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
    const params: Record<string, string> = req.params;
    const url = params[0];
    const parts = url.slice(1).split('/');

    if (prod) {
      if (parts.length === 1) {
        if (parts[0].endsWith('.js')) {
          const data = readFileSync(resolve(cwd, 'dist', parts[0]));
          res.status(200).set({ 'Content-Type': 'application/javascript' }).end(data);
        }
      } else if (parts.length === 2) {
        if (parts[0] === 'assets') {
          const data = readFileSync(resolve(cwd, 'dist', 'assets', parts[1]));
          res.status(200).set({ 'Content-Type': 'text/css' }).end(data);
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
};
