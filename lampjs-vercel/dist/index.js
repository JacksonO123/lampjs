import { createElementSSR as createElement, toHtmlString } from '@jacksonotto/lampjs-ssr';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import mime from 'mime-types';
const outDir = 'dist-ssr';
const getStyleTags = (path) => {
    let res = '';
    const files = readdirSync(path);
    files.forEach((file) => {
        if (!file.endsWith('.css'))
            return;
        res += `<link rel="stylesheet" href="/assets/${file}">`;
    });
    return res;
};
export default async function handler(request, response) {
    const url = request.url;
    const cwd = process.cwd();
    const appPath = resolve(cwd, outDir, 'main.js');
    const App = (await import(appPath)).default;
    const reg = new RegExp(/\..*$/);
    if (reg.test(url)) {
        const ext = url.split('.').at(-1);
        const fileUrl = resolve(cwd, 'dist', url.slice(1));
        const exists = existsSync(fileUrl);
        if (exists) {
            const data = readFileSync(fileUrl);
            const type = mime.lookup(ext);
            response.setHeader('Content-Type', type);
            response.status(200).end(data);
        }
        else {
            response.status(404).end('404 page not found');
        }
        return;
    }
    const clientJs = '<script type="module" src="/main.js"></script>';
    const styleTags = getStyleTags(resolve(cwd, 'dist', 'assets'));
    const options = {
        headInject: clientJs + styleTags,
        route: url
    };
    const promiseCache = {};
    let html = '<!DOCTYPE html>' + (await toHtmlString(createElement(App, null), options, promiseCache));
    html = html.replace('<!-- lampjs_cache_insert -->', `<script id="_LAMPJS_DATA_" type="application/json">${JSON.stringify(promiseCache)}</script>`);
    response.status(200).end(html);
}
