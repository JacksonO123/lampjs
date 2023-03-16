import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from './types';
import { isSvgTag, applyChildren, setElementStyle } from './util';

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

export type stateObj<T> = {
  el: () => JSX.Element;
  applyDep: (dep: () => void) => void;
  value: T;
};

export const createState = <T>(value: T, builder?: (val: T) => JSX.Element) => {
  let currentValue = value;
  let builderCb: ((val: T) => JSX.Element) | undefined = builder;
  let refNode: HTMLElement | JSX.Element;
  let deps: (() => void)[] = [];
  let nodes: (HTMLElement | JSX.Element)[] = [];

  refNode = getStateEl(currentValue, builderCb);

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

      refNode = getStateEl(currentValue, builderCb);

      nodes = nodes.map((node) => {
        const clone = refNode.cloneNode(true) as HTMLElement | JSX.Element;
        node.replaceWith(clone);
        return clone;
      });

      deps.forEach((dep) => {
        dep();
      });
    }

    const getElNode = () => {
      const clone = refNode.cloneNode(true) as HTMLElement | JSX.Element;
      nodes.push(clone);
      return clone;
    };

    return {
      el: getElNode,
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

export type asyncCallState<T> = {
  loading: boolean;
  data: T | null;
};

export const createAsyncCall = {
  get: <T>(url: string, requestInit?: RequestInit) => {
    const data: asyncCallState<T> = {
      loading: true,
      data: null
    };
    return (cb: (val: typeof data) => void, parser?: (...args: any[]) => any) => {
      cb(data);
      fetch(url, requestInit)
        .then((res) => {
          if (parser === null) return res;
          else if (parser) return parser(res);
          return res.json();
        })
        .then((resData) => {
          data.loading = false;
          data.data = resData as T;
          cb(data);
        })
        .catch(() => {
          data.loading = false;
          data.data = null;
          cb(data);
        });
    };
  }
};

export const Fragment = ({ children }: { children: JSX.Element }) => {
  return children;
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
        update();
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
