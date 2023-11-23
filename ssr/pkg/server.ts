import express from 'express';
import { toHtmlString, createElementSSR } from './index';
import App from '../src/App';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

import.meta.env.SSR = true;

globalThis.createElement = createElementSSR;

export const app = express();

export const viteServer = await createViteServer({
  server: {
    middlewareMode: true,
    hmr: true
  },
  appType: 'custom'
});

app.use(viteServer.middlewares);

app.use('*', async (req, res) => {
  const url = req.url;
  const params: Record<string, string> = req.params;

  if (params['0'] !== url) {
    res.end();
    return;
  }

  const clientJs = '<script type="module" src="./src/main.tsx"></script>';
  const viteJs = '<script type="module" src="/@vite/client"></script>';

  const options = {
    headInject: clientJs + viteJs,
    route: url
  };

  const promiseCache: Record<string, any> = {};

  let html = '<!DOCTYPE html>' + (await toHtmlString(createElement(App, null), options, promiseCache));

  html = html.replace(
    '<!-- lampjs_cache_insert -->',
    `<script id="_LAMPJS_DATA_" type="application/json">${JSON.stringify(promiseCache)}</script>`
  );

  res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
});

app.listen(PORT);
