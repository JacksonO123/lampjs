import express from 'express';
import { toHtmlString, createElementSSR } from './lib.js';
import { createServer as createViteServer } from 'vite';
import { CacheType } from './types.js';
import { ComponentFactory } from '@jacksonotto/lampjs/types';
import path from 'path';

export const startServer = async (App: ComponentFactory, port = 3000) => {
  // @ts-ignore
  if (!import.meta.env) import.meta.env = {};
  import.meta.env.SSR = true;

  globalThis.createElement = createElementSSR;

  const app = express();

  const viteServer = await createViteServer({
    plugins: [],
    server: {
      middlewareMode: true,
      hmr: true
    },
    build: {
      rollupOptions: {
        external: [path.join(__dirname, 'src', 'server.ts'), path.join(__dirname, 'dist', 'server.js')]
      }
    },
    optimizeDeps: { exclude: ['fsevents'] },
    appType: 'custom'
  });

  app.use(viteServer.middlewares);

  app.use('*', async (req, res) => {
    const params: Record<string, string> = req.params;

    const clientJs = '<script type="module" src="./src/main.tsx"></script>';
    const viteJs = '<script type="module" src="/@vite/client"></script>';

    const options = {
      headInject: clientJs + viteJs,
      route: params[0]
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
