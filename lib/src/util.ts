import { ComponentChild } from './types.js';
import { Reactive, elementIsNode } from './lampjs.js';

export const isSvgTag = (tag: string) => {
  return [
    'circle',
    'clipPath',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'foreignObject',
    'g',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'metadata',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'stop',
    'svg',
    'switch',
    'symbol',
    'text',
    'textPath',
    'title',
    'tspan',
    'use',
    'view'
  ].includes(tag);
};

export const setElementStyle = (element: JSX.Element, style: Partial<CSSStyleDeclaration>) => {
  let key;
  const keys = Object.keys(style);
  for (key of keys) {
    // @ts-ignore
    element.style[key] = style[key];
  }
};

export const applyChild = (element: JSX.SyncElement, child: ComponentChild) => {
  if (child instanceof HTMLElement || child instanceof Text) {
    if (elementIsNode(element, child)) {
      (element as JSX.NodeElements).appendChild(child as JSX.NodeElements);
    }
  } else if (typeof child === 'object') {
    if (child && child instanceof Reactive) {
      const node = document.createTextNode((child as Reactive<any>).value.toString());
      (child as Reactive<any>).addStateChangeEvent((val) => {
        node.textContent = val.toString();
      });

      if (elementIsNode(element)) {
        (element as JSX.NodeElements).appendChild(node);
      }
    }
  } else if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
    if (elementIsNode(element)) {
      (element as JSX.NodeElements).appendChild(document.createTextNode(child.toString()));
    }
  } else {
    console.warn('Unknown type to append: ', child);
  }
};

export const applyChildren = (element: JSX.SyncElement, children: ComponentChild[]) => {
  for (const child of children) {
    if (!child && child !== 0) continue;

    if (Array.isArray(child)) {
      for (const grandChild of child) {
        if (Array.isArray(grandChild)) {
          applyChildren(element, grandChild);
        } else {
          applyChild(element, grandChild);
        }
      }
    } else {
      applyChild(element, child);
    }
  }
};
