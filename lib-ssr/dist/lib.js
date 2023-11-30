import { Reactive, Suspense, createElement as createElementClient, getRouteElement, Router } from '@jacksonotto/lampjs';
const SINGLE_TAGS = ['br'];
const BUILTIN_SERVER_COMPS = [ServerSuspense, ServerRouter];
export const createElementSSR = (tag, attrs, ...children) => {
    return {
        tag,
        attrs,
        children
    };
};
const formatAttr = (attr) => {
    if (attr.startsWith('on')) {
        if (attr === 'onChange')
            attr = 'onInput';
        const finalName = attr.replace(/Capture$/, '');
        attr = finalName.toLowerCase().substring(2);
    }
    return attr.toLowerCase();
};
const sanitizeQuotes = (value) => {
    return value.replace(/\\"/g, '"').replace(/"/gm, '\\"');
};
const attrsToString = (attrs) => {
    if (attrs === null)
        return [];
    return Object.entries(attrs).reduce((acc, [key, value]) => {
        if (typeof value === 'function' || value === null || value === undefined)
            return acc;
        acc.push(`${formatAttr(key)}="${sanitizeQuotes(value.toString())}"`);
        return acc;
    }, []);
};
const isSingleTag = (tag) => {
    return SINGLE_TAGS.includes(tag);
};
const isBuiltinServerComp = (tag) => {
    return BUILTIN_SERVER_COMPS.includes(tag);
};
export const toHtmlString = async (structure, options, cache) => {
    if (structure instanceof Reactive) {
        return structure.value.toString();
    }
    else if (typeof structure === 'string') {
        return structure;
    }
    if (typeof structure.tag === 'function') {
        const props = {
            ...structure.attrs,
            // @ts-ignore
            children: structure.children
        };
        const promise = isBuiltinServerComp(structure.tag)
            ? structure.tag(props, options, cache)
            : structure.tag(props);
        // @ts-ignore
        let id = promise._lampjsSuspenseId !== undefined ? promise._lampjsSuspenseId : null;
        const res = (await promise);
        if (id)
            cache[id] = res;
        if (Array.isArray(res)) {
            return res.join('');
        }
        return await toHtmlString(res, options, cache);
    }
    let childrenHtml = '';
    if (structure.children !== undefined) {
        const newChildren = await Promise.all(structure.children.map(async (child) => await toHtmlString(child, options, cache)));
        childrenHtml = newChildren.join('');
    }
    const attrString = attrsToString(structure.attrs || {});
    const first = `<${structure.tag}${attrString.length > 0 ? ' ' : ''}${attrString.join(' ')}`;
    if (isSingleTag(structure.tag)) {
        return `${first} />`;
    }
    return `${first}>${childrenHtml}${structure.tag === 'head' ? options.headInject : ''}${structure.tag === 'body' ? '<!-- lampjs_cache_insert -->' : ''}</${structure.tag}>`;
};
export const mountSSR = async (newDom) => {
    if (import.meta.env.SSR)
        return;
    if (newDom instanceof Promise) {
        newDom = await newDom;
    }
    const target = document.body;
    newDom.childNodes.forEach((node) => {
        // let cacheData: HTMLElement | null = null;
        if (node.nodeName === 'BODY') {
            const cacheData = document.getElementById('_LAMPJS_DATA_');
            target.replaceWith(node);
            if (cacheData)
                document.body.appendChild(cacheData);
        }
        if (node.nodeName === 'HEAD') {
            const preservedElements = [];
            const devScript = document.createElement('script');
            devScript.type = 'module';
            if (import.meta.env.DEV) {
                devScript.src = './src/main.tsx';
                const viteScript = document.createElement('script');
                viteScript.src = '/@vite/client';
                viteScript.type = 'module';
                viteScript.onload = () => {
                    const children = Array.from(document.head.childNodes);
                    children.forEach((item) => {
                        if (item instanceof HTMLStyleElement && item.type === 'text/css') {
                            preservedElements.push(item);
                        }
                    });
                    document.head.replaceWith(node);
                    document.head.appendChild(devScript);
                    document.head.appendChild(viteScript);
                    preservedElements.forEach((el) => document.head.appendChild(el));
                };
            }
            else {
                devScript.src = '/index.js';
                document.addEventListener('DOMContentLoaded', () => {
                    const children = Array.from(document.head.childNodes);
                    children.forEach((item) => {
                        if ((item instanceof HTMLStyleElement && item.type === 'text/css') ||
                            (item instanceof HTMLLinkElement && item.rel === 'stylesheet')) {
                            preservedElements.push(item);
                        }
                    });
                    document.head.replaceWith(node);
                    document.head.appendChild(devScript);
                    // document.head.appendChild(viteScript);
                    preservedElements.forEach((el) => document.head.appendChild(el));
                });
            }
        }
    });
};
export function ServerSuspense({ children, fallback, decoder, render, waitServer, suspenseId }, options, cache) {
    if (import.meta.env.SSR) {
        if (waitServer) {
            const res = Promise.all(children.map((item) => toHtmlString(item, options, cache)));
            // @ts-ignore
            res._lampjsSuspenseId = suspenseId;
            return res;
        }
        return fallback;
    }
    // @ts-ignore
    return createElementClient(Suspense, { fallback, render, decoder, suspenseId }, children);
}
export function ServerRouter(props, options, cache) {
    const { children } = props;
    if (import.meta.env.SSR) {
        const handleChildRoute = (child) => {
            if (typeof child.tag === 'function') {
                const routeData = child.tag({
                    ...child.attrs,
                    children: child.children
                });
                const el = getRouteElement(options.route, '/', routeData);
                if (Array.isArray(el)) {
                    return el.map((item) => toHtmlString(item, options, cache));
                }
                else if (el !== null) {
                    return [toHtmlString(el, options, cache)];
                }
            }
            return null;
        };
        let res;
        if (Array.isArray(children)) {
            res = Promise.all(children
                .reduce((acc, curr) => {
                const temp = handleChildRoute(curr);
                if (temp) {
                    acc.push(temp);
                }
                return acc;
            }, [])
                .flat());
        }
        else {
            res = Promise.all(handleChildRoute(children) || '');
        }
        return res;
    }
    else {
        // @ts-ignore
        return createElementClient(Router, null, ...children);
    }
}
