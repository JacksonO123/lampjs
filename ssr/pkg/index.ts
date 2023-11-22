import {
  ComponentFactory,
  ComponentAttributes,
  ComponentChild,
  SuspenseFn,
  ResponseData,
  ValueFromResponse
} from '@jacksonotto/lampjs/dist/types';
import { FetchResponse, Reactive, Suspense, createElement as createElementClient } from '@jacksonotto/lampjs';

export type DOMStructure = {
  readonly tag: string | ComponentFactory;
  readonly attrs: ComponentAttributes | null;
  children: ComponentChild[];
};

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
    if (value instanceof Function || value === null || value === undefined) return acc;

    acc.push(`${formatAttr(key)}="${sanitizeQuotes(value.toString())}"`);
    return acc;
  }, [] as string[]);
};

const isSingleTag = (tag: string) => {
  return ['br'].includes(tag);
};

export type HtmlOptions = {
  route: string;
  headInject: string;
};

export const toHtmlString = async (
  structure: DOMStructure | string,
  options: HtmlOptions,
  cache: Record<string, any>
): Promise<string> => {
  if (structure instanceof Reactive) {
    return structure.value.toString();
  } else if (typeof structure === 'string') {
    return structure;
  }

  if (structure.tag instanceof Function) {
    const props = {
      ...structure.attrs,
      children: structure.children
    };

    const promise =
      // @ts-ignore
      structure.tag === ServerSuspense ? structure.tag(props, options, cache) : structure.tag(props);

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

export const mountSSR = async (target: HTMLElement, newDom: JSX.Element) => {
  if (newDom instanceof Promise) {
    newDom = await newDom;
  }

  (newDom as JSX.NodeElements).childNodes.forEach((node) => {
    if (node.nodeName === 'BODY') {
      target.replaceWith(node);
    }
    if (import.meta.env.DEV) {
      if (node.nodeName === 'HEAD') {
        const devScript = document.createElement('script');
        devScript.src = './src/main.tsx';
        devScript.type = 'module';

        const viteScript = document.createElement('script');
        viteScript.src = '/@vite/client';
        viteScript.type = 'module';

        document.addEventListener('DOMContentLoaded', () => {
          document.head.replaceWith(node);
          document.head.appendChild(devScript);
          document.head.appendChild(viteScript);
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

export const ServerSuspense = <T extends FetchResponse<any> | Promise<any>, K extends boolean>(
  { children, fallback, decoder, render, waitServer, suspenseId }: SuspenseProps<T, K>,
  options: HtmlOptions,
  cache: Record<string, any>
) => {
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
  return createElementClient(Suspense, { fallback, render, decoder }, children);
};
