import {
  ComponentFactory,
  ComponentAttributes,
  ComponentChild,
  SuspenseFn,
  ResponseData,
  ValueFromResponse,
  FetchResponse
} from '@jacksonotto/lampjs/types';
import {
  Reactive,
  RouteData,
  Suspense,
  createElement as createElementClient,
  getRouteElement,
  Router
} from '@jacksonotto/lampjs';
import { BuiltinServerComp, CacheType, DOMStructure, HtmlOptions } from './types.js';

const SINGLE_TAGS = ['br'];
const BUILTIN_SERVER_COMPS: Function[] = [ServerSuspense, ServerRouter];

export const createElementSSR = (
  tag: string | ComponentFactory,
  attrs: ComponentAttributes | null,
  ...children: ComponentChild[]
): DOMStructure => {
  return {
    tag,
    attrs,
    children
  } as const;
};

const formatAttr = (attr: string) => {
  if (attr.startsWith('on')) {
    if (attr === 'onChange') attr = 'onInput';
    const finalName = attr.replace(/Capture$/, '');
    attr = finalName.toLowerCase().substring(2);
  }

  return attr.toLowerCase();
};

const sanitizeQuotes = (value: string) => {
  return value.replace(/\\"/g, '"').replace(/"/gm, '\\"');
};

const attrsToString = (attrs: ComponentAttributes) => {
  if (attrs === null) return [];

  return Object.entries(attrs).reduce((acc, [key, value]) => {
    if (typeof value === 'function' || value === null || value === undefined) return acc;

    acc.push(`${formatAttr(key)}="${sanitizeQuotes(value.toString())}"`);
    return acc;
  }, [] as string[]);
};

const isSingleTag = (tag: string) => {
  return SINGLE_TAGS.includes(tag);
};

const isBuiltinServerComp = (tag: Function) => {
  return BUILTIN_SERVER_COMPS.includes(tag);
};

export const toHtmlString = async (
  structure: DOMStructure | string,
  options: HtmlOptions,
  cache: CacheType
): Promise<string> => {
  if (structure instanceof Reactive) {
    return structure.value.toString();
  } else if (typeof structure === 'string') {
    return structure;
  }

  if (typeof structure.tag === 'function') {
    const props: ComponentAttributes = {
      ...structure.attrs,
      // @ts-ignore
      children: structure.children
    };

    const promise = isBuiltinServerComp(structure.tag)
      ? (structure.tag as BuiltinServerComp)(props, options, cache)
      : structure.tag(props);

    // @ts-ignore
    let id: string | null = promise._lampjsSuspenseId !== undefined ? promise._lampjsSuspenseId : null;

    const res = (await promise) as unknown as DOMStructure | string[];

    if (id) cache[id] = res;

    if (Array.isArray(res)) {
      return res.join('');
    }

    return await toHtmlString(res, options, cache);
  }

  let childrenHtml = '';
  if (structure.children !== undefined) {
    const newChildren = await Promise.all(
      structure.children.map(
        async (child) => await toHtmlString(child as unknown as DOMStructure, options, cache)
      )
    );

    childrenHtml = newChildren.join('');
  }

  const attrString = attrsToString(structure.attrs || {});

  const first = `<${structure.tag}${attrString.length > 0 ? ' ' : ''}${attrString.join(' ')}`;

  if (isSingleTag(structure.tag)) {
    return `${first} />`;
  }

  return `${first}>${childrenHtml}${structure.tag === 'head' ? options.headInject : ''}${
    structure.tag === 'body' ? '<!-- lampjs_cache_insert -->' : ''
  }</${structure.tag}>`;
};

export const mountSSR = async (newDom: JSX.Element) => {
  if (import.meta.env.SSR) return;

  if (newDom instanceof Promise) {
    newDom = await newDom;
  }

  const target = document.body;

  (newDom as JSX.NodeElements).childNodes.forEach((node) => {
    // let cacheData: HTMLElement | null = null;

    if (node.nodeName === 'BODY') {
      const cacheData = document.getElementById('_LAMPJS_DATA_');
      target.replaceWith(node);
      if (cacheData) document.body.appendChild(cacheData);
    }

    if (node.nodeName === 'HEAD') {
      const preservedElements: HTMLElement[] = [];

      const devScript = document.createElement('script');
      devScript.type = 'module';

      if (import.meta.env.DEV) {
        devScript.src = './src/main.tsx';

        const viteScript = document.createElement('script');
        viteScript.src = '/@vite/client';
        viteScript.type = 'module';

        viteScript.onload = () => {
          const children = Array.from(document.head.childNodes) as HTMLElement[];
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
      } else {
        devScript.src = '/index.js';

        document.addEventListener('DOMContentLoaded', () => {
          const children = Array.from(document.head.childNodes) as HTMLElement[];
          children.forEach((item) => {
            if (
              (item instanceof HTMLStyleElement && item.type === 'text/css') ||
              (item instanceof HTMLLinkElement && item.rel === 'stylesheet')
            ) {
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

type SuspenseProps<T extends FetchResponse<any> | Promise<any>, K extends boolean> = {
  // children is actually type DOMStructure
  children: T | JSX.Element;
  fallback: JSX.Element;
  render?: SuspenseFn<T>;
  decoder?: (value: ResponseData<ValueFromResponse<T>>) => any;
  waitServer?: K;
} & (K extends true
  ? {
      suspenseId: string;
    }
  : { suspenseId?: string });

export function ServerSuspense<T extends FetchResponse<any> | Promise<any>, K extends boolean>(
  { children, fallback, decoder, render, waitServer, suspenseId }: SuspenseProps<T, K>,
  options: HtmlOptions,
  cache: CacheType
) {
  if (import.meta.env.SSR) {
    if (waitServer) {
      const res = Promise.all(
        (children as unknown as DOMStructure[]).map((item) => toHtmlString(item, options, cache))
      ) as unknown as JSX.Element;

      // @ts-ignore
      res._lampjsSuspenseId = suspenseId;

      return res;
    }

    return fallback;
  }

  // @ts-ignore
  return createElementClient(Suspense, { fallback, render, decoder, suspenseId }, children);
}

type ServerRouterPropsJSX = {
  children: JSX.Element | JSX.Element[];
};

type ServerRouterProps = {
  children: DOMStructure[];
};

export function ServerRouter(props: ServerRouterPropsJSX, options: HtmlOptions, cache: CacheType) {
  const { children } = props as unknown as ServerRouterProps;

  if (import.meta.env.SSR) {
    const handleChildRoute = (child: DOMStructure) => {
      if (typeof child.tag === 'function') {
        const routeData = child.tag({
          ...child.attrs,
          children: child.children
        }) as unknown as RouteData<DOMStructure>;
        const el = getRouteElement<DOMStructure>(options.route, '/', routeData);

        if (Array.isArray(el)) {
          return el.map((item) => toHtmlString(item, options, cache));
        } else if (el !== null) {
          return [toHtmlString(el, options, cache)];
        }
      }

      return null;
    };

    let res: Promise<string | string[]>;

    if (Array.isArray(children)) {
      res = Promise.all(
        children
          .reduce((acc, curr) => {
            const temp = handleChildRoute(curr);

            if (temp) {
              acc.push(temp);
            }

            return acc;
          }, [] as Promise<string>[][])
          .flat()
      );
    } else {
      res = Promise.all(handleChildRoute(children) || '');
    }

    return res as unknown as JSX.Element;
  } else {
    // @ts-ignore
    return createElementClient(Router, null, ...children);
  }
}
