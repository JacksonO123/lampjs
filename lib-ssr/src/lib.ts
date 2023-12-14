import type {
  ComponentFactory,
  ComponentAttributes,
  ComponentChild,
  ResponseData
} from '@jacksonotto/lampjs/types';
import {
  Reactive,
  RouteData,
  createElement as createElementClient,
  getRouteElement,
  createState,
  State,
  CaseData,
  getSwitchElement,
  Suspense as ClientSuspense,
  Router as ClientRouter,
  For as ClientFor,
  If as ClientIf,
  Switch as ClientSwitch,
  Link as ClientLink,
  getStateValue
} from '@jacksonotto/lampjs';
import { BuiltinServerComp, CacheType, DOMStructure, HtmlOptions } from './types.js';
import { RouterPropsJSX } from '@jacksonotto/lampjs/types';

const SINGLE_TAGS = ['br'];
const BUILTIN_SERVER_COMPS: Function[] = [Suspense, Router, For, If, Link];

export function createElementSSR(
  tag: string | ComponentFactory,
  attrs: ComponentAttributes | null,
  ...children: ComponentChild[]
): DOMStructure {
  return {
    tag,
    attrs,
    children
  } as const;
}

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
      structure.children
        .flat()
        .map(async (child) => await toHtmlString(child as unknown as DOMStructure, options, cache))
    );

    childrenHtml = newChildren.join('');
  }

  const attrString = attrsToString(structure.attrs || {});

  const first = `<${structure.tag}${attrString.length > 0 ? ' ' : ''}${attrString.join(' ')}`;

  if (isSingleTag(structure.tag)) {
    return `${first} />`;
  }

  return `${first}>${structure.tag === 'head' ? options.headInject : ''}${childrenHtml}${
    structure.tag === 'body' ? '<!-- lampjs_cache_insert -->' : ''
  }</${structure.tag}>`;
};

const setupEnv = () => {
  // @ts-ignore
  if (!import.meta.env) import.meta.env = {};
  import.meta.env.SSR = true;
};

export const mountSSR = async (newDom: JSX.Element) => {
  // mount ssr is called from a module imported from the server module
  // in a node environment it does not have access to import.meta.env set
  // in the server module, so setting it here in the entry point
  if (import.meta.env?.SSR === undefined) setupEnv();

  if (import.meta.env.SSR) return;

  if (newDom instanceof Promise) {
    newDom = await newDom;
  }

  (newDom as JSX.NodeElements).childNodes.forEach((node) => {
    if (node.nodeName === 'BODY') {
      const cacheData = document.getElementById('_LAMPJS_DATA_');
      document.body.replaceWith(node);
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
        devScript.src = '/main.js';

        document.addEventListener('DOMContentLoaded', () => {
          const children = Array.from(document.head.childNodes) as HTMLElement[];
          children.forEach((item) => {
            if (
              (item instanceof HTMLStyleElement && item.type === 'text/css') ||
              (item instanceof HTMLLinkElement && item.rel === 'stylesheet') ||
              item instanceof HTMLTitleElement
            ) {
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

export type DataFromPromiseResponse<T extends Promise<any> | JSX.Element> = Awaited<T> extends {
  json(): Promise<infer R>;
}
  ? R
  : Awaited<T>;

type ServerSuspenseProps<T extends Promise<any> | JSX.Element, K extends boolean> = {
  // children is actually type DOMStructure
  children: T | JSX.Element;
  fallback: JSX.Element;
  render?: (val: DataFromPromiseResponse<T>) => JSX.Element;
  decoder?: (value: ResponseData<Awaited<T>>) => Promise<any>;
  suspenseId?: string;
  waitServer?: K;
} & (K extends true
  ? {
      suspenseId: string;
    }
  : { suspenseId?: string });

export function Suspense<T extends Promise<any> | JSX.Element, K extends boolean>(
  // @ts-ignore
  { children, fallback, decoder, render, waitServer, suspenseId }: ServerSuspenseProps<T, K>,
  options: HtmlOptions,
  cache: CacheType
) {
  const comp = (children as unknown as DOMStructure[])[0];

  if (import.meta.env.SSR) {
    if (waitServer) {
      const res = new Promise(async (resolve) => {
        let promiseData: any;

        if (comp instanceof Promise) {
          promiseData = await comp;
        } else {
          promiseData = await (comp.tag as ComponentFactory)(
            {
              ...comp.attrs
            },
            // @ts-ignore
            ...comp.children
          );
        }

        if (promiseData instanceof Response) {
          if (decoder) promiseData = await decoder(promiseData);
          else promiseData = await promiseData.json();
        }

        if (render) promiseData = render(promiseData);

        const res = toHtmlString(promiseData as DOMStructure, options, cache) as unknown as JSX.Element;

        resolve(res);
      });

      // @ts-ignore
      res._lampjsSuspenseId = suspenseId;

      return res as unknown as JSX.Element;
    }

    return fallback;
  }

  return createElementClient(
    ClientSuspense as ComponentFactory,
    // @ts-ignore
    { fallback, render, decoder, suspenseId },
    children
  );
}

const page404 = () => {
  return createElementSSR(
    'html',
    { lang: 'en' },
    // @ts-ignore
    createElementSSR(
      'head',
      null,
      // @ts-ignore
      createElementSSR('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
      createElementSSR('meta', { name: 'description', content: '404 page not found' }),
      createElementSSR('title', null, '404 page not found')
    ),
    // @ts-ignore
    createElementSSR('body', null, createElementSSR('span', null, '404 page not found'))
  );
};

type ServerRouterProps = {
  children: DOMStructure[];
};

export function Router(props: RouterPropsJSX, options: HtmlOptions, cache: CacheType) {
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
          return el.map((item) => {
            return toHtmlString(item, options, cache);
          });
        } else if (el !== null) {
          return [toHtmlString(el, options, cache)];
        }
      }

      return null;
    };

    let res: Promise<string | string[]>;

    if (Array.isArray(children)) {
      const temp = children
        .reduce((acc, curr) => {
          const temp = handleChildRoute(curr);

          if (temp) {
            acc.push(temp);
          }

          return acc;
        }, [] as Promise<string>[][])
        .flat();

      if (temp.length === 0) {
        temp.push(toHtmlString(page404(), options, cache));
      }

      res = Promise.all(temp);
    } else {
      res = Promise.all(handleChildRoute(children) || '');
    }

    return res as unknown as JSX.Element;
  }

  const replacePage = (newPage: JSX.Element) => {
    mountSSR(newPage);
  };

  return createElementClient(
    ClientRouter as ComponentFactory,
    { onRouteChange: replacePage } as unknown as ComponentAttributes,
    ...(ensureArray(children) as unknown as ComponentChild[])
  );
}

type ServerForItemFnJSX<T> = (
  item: State<T>,
  index: State<number>,
  cleanup: (...args: Reactive<any>[]) => void
) => JSX.Element;

type ServerForItemFn<T> = (
  item: State<T>,
  index: State<number>,
  cleanup: (...args: Reactive<any>[]) => void
) => DOMStructure;

type ServerForPropsJSX<T> = {
  each: Reactive<T[]>;
  children: ServerForItemFnJSX<T>;
};

type ServerForProps<T> = {
  each: Reactive<T[]>;
  children: [ServerForItemFn<T>];
};

export function For<T>(props: ServerForPropsJSX<T>, options: HtmlOptions, cache: CacheType) {
  const { each, children } = props as unknown as ServerForProps<T>;

  if (import.meta.env.SSR) {
    return Promise.all(
      each.value.map((item, index) =>
        toHtmlString(
          children[0](createState(item), createState(index), () => {}),
          options,
          cache
        )
      )
    ) as unknown as JSX.Element;
  }

  return createElementClient(
    ClientFor as unknown as ComponentFactory,
    { each } as unknown as ComponentAttributes,
    children[0] as unknown as ComponentChild[]
  );
}

type ServerIfProps = {
  condition: Reactive<boolean>;
  then: DOMStructure;
  else: DOMStructure;
};

export type IfPropsJSX = {
  condition: Reactive<boolean>;
  then: JSX.Element;
  else: JSX.Element;
};

export function If(props: IfPropsJSX) {
  const { condition, then, else: elseBranch } = props as unknown as ServerIfProps;

  if (import.meta.env.SSR) {
    return (condition.value ? then : elseBranch) as unknown as JSX.Element;
  }

  return createElementClient(
    ClientIf as ComponentFactory,
    { condition, then, else: elseBranch } as unknown as ComponentAttributes
  );
}

export type SwitchPropsJSX<T> = {
  children: JSX.Element | JSX.Element[];
  condition: Reactive<T>;
};

export type SwitchProps<T> = {
  children: CaseData<T> | CaseData<T>[];
  condition: Reactive<T>;
};

export function Switch<T>(props: SwitchPropsJSX<T>, options: HtmlOptions, cache: CacheType) {
  const { children, condition } = props as unknown as SwitchProps<T>;

  if (import.meta.env.SSR) {
    const cases = (children as unknown as DOMStructure[]).map(
      (child) =>
        (child.tag as ComponentFactory)({
          ...child.attrs,
          children: child.children
        }) as unknown as CaseData<T>
    );
    const el = getSwitchElement(cases, condition.value) as unknown as DOMStructure[];
    return toHtmlString(el[0], options, cache) as unknown as JSX.Element;
  }

  return createElementClient(
    ClientSwitch as ComponentFactory,
    { condition } as unknown as ComponentAttributes,
    ...ensureArray(children)
  );
}

type LinkProps = Omit<JSX.HTMLAttributes, 'href'> & {
  href: string | Reactive<string>;
};

type ServerLinkProps = LinkProps & {
  revalidate?: boolean;
};

function ensureArray<T>(value: T | T[]) {
  if (Array.isArray(value)) return value;
  return [value];
}

export function Link(
  { children, href, revalidate }: ServerLinkProps,
  options: HtmlOptions,
  cache: CacheType
) {
  const tempChildren = ensureArray(children);

  if (import.meta.env.SSR) {
    const el = createElementSSR('a', { href: getStateValue(href) }, ...tempChildren);
    return toHtmlString(el, options, cache) as unknown as JSX.Element;
  }

  if (revalidate) {
    return createElementClient('a', { href: getStateValue(href) }, ...tempChildren);
  }

  return createElementClient(ClientLink as ComponentFactory, { href: getStateValue(href) }, ...tempChildren);
}

export default isBuiltinServerComp;
