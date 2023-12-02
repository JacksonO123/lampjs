import { Reactive, RouteData, createElement as createElementClient, getRouteElement, createState, getSwitchElement, Suspense as ClientSuspense, Router as ClientRouter, For as ClientFor, If as ClientIf, Switch as ClientSwitch, Link as ClientLink, getStateValue } from '@jacksonotto/lampjs';
const SINGLE_TAGS = ['br'];
const BUILTIN_SERVER_COMPS = [Suspense, Router, For, If, Link, Route];
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
        const newChildren = await Promise.all(structure.children
            .flat()
            .map(async (child) => await toHtmlString(child, options, cache)));
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
    newDom.childNodes.forEach((node) => {
        if (node.nodeName === 'BODY') {
            const cacheData = document.getElementById('_LAMPJS_DATA_');
            document.body.replaceWith(node);
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
                            (item instanceof HTMLLinkElement && item.rel === 'stylesheet') ||
                            item instanceof HTMLTitleElement) {
                            preservedElements.push(item);
                        }
                    });
                    document.head.replaceWith(node);
                    document.head.appendChild(devScript);
                    preservedElements.forEach((el) => document.head.appendChild(el));
                });
            }
        }
    });
};
export function Suspense(
// @ts-ignore
{ children, fallback, decoder, render, waitServer, suspenseId }, options, cache) {
    const comp = children[0];
    if (import.meta.env.SSR) {
        if (waitServer) {
            const res = new Promise(async (resolve) => {
                let promiseData;
                if (comp instanceof Promise) {
                    promiseData = await comp;
                }
                else {
                    promiseData = await comp.tag({
                        ...comp.attrs
                    }, 
                    // @ts-ignore
                    ...comp.children);
                }
                if (promiseData instanceof Response) {
                    if (decoder)
                        promiseData = await decoder(promiseData);
                    else
                        promiseData = await promiseData.json();
                }
                if (render)
                    promiseData = render(promiseData);
                const res = toHtmlString(promiseData, options, cache);
                resolve(res);
            });
            // @ts-ignore
            res._lampjsSuspenseId = suspenseId;
            return res;
        }
        return fallback;
    }
    return createElementClient(ClientSuspense, 
    // @ts-ignore
    { fallback, render, decoder, suspenseId }, children);
}
const page404 = () => {
    return createElementSSR('html', { lang: 'en' }, 
    // @ts-ignore
    createElementSSR('head', null, 
    // @ts-ignore
    createElementSSR('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }), createElementSSR('meta', { name: 'description', content: '404 page not found' }), createElementSSR('title', null, '404 page not found')), 
    // @ts-ignore
    createElementSSR('body', null, createElementSSR('span', null, '404 page not found')));
};
export function Router(props, options, cache) {
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
                    return el.map((item) => {
                        return toHtmlString(item, options, cache);
                    });
                }
                else if (el !== null) {
                    return [toHtmlString(el, options, cache)];
                }
            }
            return null;
        };
        let res;
        if (Array.isArray(children)) {
            const temp = children
                .reduce((acc, curr) => {
                const temp = handleChildRoute(curr);
                if (temp) {
                    acc.push(temp);
                }
                return acc;
            }, [])
                .flat();
            if (temp.length === 0) {
                temp.push(toHtmlString(page404(), options, cache));
            }
            res = Promise.all(temp);
        }
        else {
            res = Promise.all(handleChildRoute(children) || '');
        }
        return res;
    }
    const replacePage = (newPage) => {
        mountSSR(newPage);
    };
    return createElementClient(ClientRouter, { onRouteChange: replacePage }, ...(Array.isArray(children) ? children : [children]));
}
export function Route({ path, content, children }) {
    return new RouteData(path, content, children ? (Array.isArray(children) ? children : [children]) : []);
}
export function For(props, options, cache) {
    const { each, children } = props;
    if (import.meta.env.SSR) {
        return Promise.all(each.value.map((item, index) => toHtmlString(children[0](createState(item), createState(index), () => { }), options, cache)));
    }
    return createElementClient(ClientFor, { each }, children[0]);
}
export function If(props) {
    const { condition, then, else: elseBranch } = props;
    if (import.meta.env.SSR) {
        return (condition.value ? then : elseBranch);
    }
    return createElementClient(ClientIf, { condition, then, else: elseBranch });
}
export function Switch(props, options, cache) {
    const { children, condition } = props;
    if (import.meta.env.SSR) {
        const cases = children.map((child) => child.tag({
            ...child.attrs,
            children: child.children
        }));
        const el = getSwitchElement(cases, condition.value);
        return toHtmlString(el[0], options, cache);
    }
    return createElementClient(ClientSwitch, { condition }, ...(Array.isArray(children) ? children : [children]));
}
export function Link({ children, href }, options, cache) {
    if (import.meta.env.SSR) {
        const el = createElementSSR('a', { href: getStateValue(href) }, ...(Array.isArray(children) ? children : [children]));
        return toHtmlString(el, options, cache);
    }
    return createElementClient(ClientLink, { href }, ...(Array.isArray(children) ? children : [children]));
}
