import express from 'express';
import { createElementSSR, toHtmlString } from './lib.js';
import { createServer as createViteServer } from 'vite';
import { CacheType } from './types.js';
import { ComponentFactory } from '@jacksonotto/lampjs/types';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { outDir } from './constants.js';
import { resolve } from 'path';
import chokidar from 'chokidar';
import mime from 'mime-types';

// @ts-ignore
if (!import.meta.env) import.meta.env = {};
import.meta.env.SSR = true;

const args = process.argv.slice(2);

const defaultPort = 3000;
const argProd = args[1] === 'prod';

const clearModuleCache = (moduleName: string) => {
  delete require.cache[require.resolve(moduleName)];
};

export const getStyleTags = (path: string) => {
  let res = '';
  const files = readdirSync(path);

  files.forEach((file) => {
    if (!file.endsWith('.css')) return;

    res += `<link rel="stylesheet" href="/assets/${file}">`;
  });

  return res;
};

export default async function startServer(
  cliProd?: boolean,
  cliPort?: number,
  getApp?: (app: Express.Application) => void
) {
  const app = express();
  getApp?.(app);

  const prod = cliProd || argProd;
  const port = cliPort || defaultPort;

  globalThis.createElement = createElementSSR;

  const cwd = process.cwd();
  let App: ComponentFactory | null = null;
  const appPath = prod ? resolve(cwd, outDir, 'main.js') : resolve(cwd, 'src', 'main.tsx');
  App = (await import(appPath)).default as ComponentFactory;

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

      App = (await import(appPath)).default;

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

        return;
      }
    }

    const clientJs = prod
      ? '<script type="module" src="/main.js"></script>'
      : '<script type="module" src="./src/main.tsx"></script>';

    const viteJs = prod ? '' : '<script type="module" src="/@vite/client"></script>';
    const styleTags = prod ? getStyleTags(resolve(cwd, 'dist', 'assets')) : '';

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

  if (!getApp) {
    console.log(`[lampjs:server] watching on port ${port}${!prod ? `\n - http://localhost:${port}` : ''}`);
    app.listen(port);
  }
}
