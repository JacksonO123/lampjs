import express from 'express';
import { toHtmlString, createElementSSR } from './index';
import App from '../src/App';
import { createServer as createViteServer } from 'vite';

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

app.use('*', (req, res) => {
  const url = req.url;

  const html =
    '<!DOCTYPE html>' +
    toHtmlString(createElement(App, null), {
      headInject:
        '<script type="module" src="./src/main.tsx"></script><script type="module" src="/@vite/client"></script>',
      route: url
    });

  res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
});

app.listen(3000);
