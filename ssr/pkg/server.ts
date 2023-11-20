import express from 'express';
import { toHtmlString, createElementSSR } from './index';
import App from '../src/App';
import { createServer as createViteServer } from 'vite';

import.meta.env.SSR = true;

// @ts-ignore
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

  const clientJs = '<script type="module" src="./src/main.tsx"></script>';
  const viteJs = '<script type="module" src="/@vite/client"></script>';

  const html =
    '<!DOCTYPE html>' +
    (await toHtmlString(createElement(App, null), {
      headInject: clientJs + viteJs,
      route: url
    }));

  res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
});

app.listen(3000);
