import { ComponentFactory, ComponentAttributes, ComponentChild } from '@jacksonotto/lampjs/dist/types';
import { Reactive } from '@jacksonotto/lampjs';

export type DOMStructure = {
  readonly tag: string | ComponentFactory;
  readonly attrs: ComponentAttributes | null;
  readonly children: ComponentChild[];
};

export const createElementSSR = (
  tag: string | ComponentFactory,
  attrs: ComponentAttributes | null,
  ...children: ComponentChild[]
): DOMStructure =>
  ({
    tag,
    attrs,
    children
  }) as const;

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

type HtmlOptions = {
  route: string;
  headInject: string;
};

export const toHtmlString = (structure: DOMStructure | string, options: HtmlOptions): string => {
  if (structure instanceof Reactive) {
    return structure.value.toString();
  } else if (typeof structure === 'string') {
    return structure;
  }

  if (structure.tag instanceof Function) {
    const res = structure.tag(structure.attrs || {}) as unknown as DOMStructure;
    return toHtmlString(res, options);
  }

  let childrenHtml = '';
  if (structure.children !== undefined) {
    structure.children.forEach((child) => {
      childrenHtml += toHtmlString(child as unknown as DOMStructure, options);
    });
  }

  const attrString = attrsToString(structure.attrs || {});

  const first = `<${structure.tag}${attrString.length > 0 ? ' ' : ''}${attrString.join(' ')}`;

  if (isSingleTag(structure.tag)) {
    return `${first} />`;
  }

  return `${first}>${childrenHtml}${structure.tag === 'head' ? options.headInject : ''}</${structure.tag}>`;
};

export const mountSSR = async (target: HTMLElement, newDom: JSX.Element) => {
  if (newDom instanceof Promise) {
    newDom = await newDom;
  }

  newDom.childNodes.forEach((node) => {
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

        document.addEventListener('DOMContentLoaded', function () {
          document.head.replaceWith(node);
          console.log(devScript, viteScript);
          document.head.appendChild(devScript);
          document.head.appendChild(viteScript);
        });
      }
    }
  });
};
