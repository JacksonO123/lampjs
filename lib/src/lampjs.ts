import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from './types';
import { isSvgTag, setElementStyle, applyChildren } from 'start-dom-jsx/dist/utils';

export const mount = (root: HTMLElement | null, el: JSX.Element) => {
  if (!root) return;

  root.appendChild(el);
};

const getStateEl = <T>(val: T, builder?: (value: T) => JSX.Element) => {
  if (builder) {
    return builder(val);
  } else {
    const node = document.createElement('span');
    node.innerHTML = val + '';
    return node;
  }
};

type stateObj<T> = {
  el: JSX.Element;
  applyDep: (dep: () => void) => void;
  value: T;
};

export const createState = <T>(value: T, builder?: (val: T) => JSX.Element) => {
  let currentValue = value;
  let builderCb: ((val: T) => JSX.Element) | undefined = builder;
  let node: HTMLElement | JSX.Element;
  let deps: (() => void)[] = [];

  node = getStateEl(currentValue, builderCb);

  const applyDep = (dep: () => void) => {
    deps.push(dep);
  };

  return (newValue?: T | ((val: T) => T)) => {
    if (newValue !== undefined) {
      if (typeof newValue === 'function') {
        const updateCb = newValue as (val: T) => T;
        currentValue = updateCb(currentValue);
      } else {
        currentValue = newValue;
      }

      const newNode = getStateEl(currentValue, builderCb);
      node.replaceWith(newNode);
      node = newNode;

      deps.forEach((dep) => {
        dep();
      });
    }
    return {
      el: node,
      value: currentValue,
      applyDep
    } as stateObj<T>;
  };
};

export const createEffect = <T extends (val?: any) => stateObj<any>>(cb: () => void, deps: T[]) => {
  deps.forEach((dep) => {
    dep().applyDep(cb);
  });
};

const xlinkNS = 'http://www.w3.org/1999/xlink';
export const createElement = (
  tag: string | ComponentFactory,
  attrs: ComponentAttributes,
  ...children: ComponentChild[]
) => {
  if (typeof tag === 'function') return tag(Object.assign(Object.assign({}, attrs), { children }));
  const isSvg = isSvgTag(tag);
  const element = isSvg
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  if (attrs) {
    if (
      attrs.style &&
      typeof attrs.style !== 'string' &&
      typeof attrs.style !== 'number' &&
      typeof attrs.style !== 'boolean'
    ) {
      setElementStyle(element, attrs.style as Partial<CSSStyleDeclaration>);
      delete attrs.style;
    }
    for (let name of Object.keys(attrs)) {
      const value = attrs[name];
      if (tag === 'input' && name === 'value') {
        const state = value as (val?: any) => stateObj<any>;
        const update = () => {
          (element as HTMLInputElement).value = state().value;
        };
        state().applyDep(update);
      } else if (name.startsWith('on')) {
        if (name === 'onChange') {
          name = 'onInput';
        }
        const finalName = name.replace(/Capture$/, '');
        const useCapture = name !== finalName;
        const eventName = finalName.toLowerCase().substring(2);
        if (value && typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean')
          element.addEventListener(eventName, value as EventListenerOrEventListenerObject, useCapture);
      } else if (isSvg && name.startsWith('xlink:')) {
        if (value && typeof value !== 'number' && typeof value !== 'boolean') {
          element.setAttributeNS(xlinkNS, name, value as string);
        }
      } else if (value === true) {
        element.setAttribute(name, name);
      } else if (value || value === 0) {
        element.setAttribute(name, value.toString());
      }
    }
  }
  applyChildren(element, children);
  return element;
};
