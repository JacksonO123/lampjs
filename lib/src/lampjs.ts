import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes, BaseProps } from './types';
import { isSvgTag, applyChildren, setElementStyle } from './util';

let mountEvents: (() => void)[] = [];

export const mount = (root: HTMLElement | null, el: JSX.Element | JSX.Element[]) => {
  if (!root || !el) return;

  function mountEl(el: JSX.Element | JSX.Element[]) {
    if (Array.isArray(el)) {
      el.forEach((newEl) => mountEl(newEl));
    } else {
      root!.appendChild(el);
    }
  }

  mountEl(el);

  mountEvents.forEach((event) => event());
  mountEvents = [];
};

export class Reactive<T> {
  private onStateChange: ((val: T) => void)[];
  value: T;
  constructor(value: T) {
    this.value = value;
    this.onStateChange = [];
  }
  toString() {
    return this.value;
  }
  addStateChangeEvent(event: (val: T) => void) {
    this.onStateChange.push(event);
  }
  distributeNewState(data: T) {
    this.value = data;
    this.onStateChange.forEach((fn) => fn(data));
  }
}

export const onPageMount = (cb: () => void) => {
  mountEvents.push(cb);
};

export const createState = <T>(value: T) => {
  let currentState = new Reactive(value);

  const updateCb = (newState?: T | ((val: T) => T)) => {
    if (newState !== undefined) {
      const newStateVal =
        newState instanceof Function ? (newState as (val: T) => T)(currentState.value) : newState;
      currentState.distributeNewState(newStateVal);
    }

    return currentState;
  };

  return updateCb;
};

export type State<T> = ReturnType<typeof createState<T>>;

export const createEffect = <T extends Reactive<any>>(cb: () => void, deps: T[]) => {
  if (deps.length === 0) {
    mountEvents.push(cb);
  }

  deps.forEach((dep) => {
    dep.addStateChangeEvent(cb);
  });
};

export const isState = <T>(val: T | State<T>) => {
  return val instanceof Function ? val() instanceof Reactive : false;
};

type InnerStateFromArray<T extends readonly Reactive<any>[]> = {
  [K in keyof T]: T[K] extends Reactive<infer U> ? U : Exclude<T[K], Reactive<any>>;
};

export const reactive = <T extends readonly (Reactive<any> | any)[], K>(
  fn: (...val: InnerStateFromArray<T>) => K,
  states: T
) => {
  const values = states.map((s) => (s instanceof Reactive ? s.value : s));
  const res = createState(fn(...(values as InnerStateFromArray<T>)));

  states.forEach((state, index) => {
    if (!(state instanceof Reactive)) return;

    state.addStateChangeEvent((val) => {
      values[index] = val;
      const newValue = fn(...(values as InnerStateFromArray<T>));
      res(newValue);
    });
  });

  return res;
};

export const reactiveElement = <T extends readonly Reactive<any>[]>(
  fn: (...val: InnerStateFromArray<T>) => ComponentChild,
  states: T
): JSX.Element | null => {
  const values = states.map((s) => s.value);
  let res: ComponentChild = fn(...(values as InnerStateFromArray<T>));

  if (!(res instanceof HTMLElement) && !(res instanceof SVGElement) && !(res instanceof Text)) {
    res = document.createTextNode(res + '');
  }

  const onStateChange = (val: unknown, index: number) => {
    values[index] = val;
    const newNode = fn(...(values as InnerStateFromArray<T>));
    if (!res || !newNode) return;
    if (res instanceof Text) {
      if (newNode instanceof HTMLElement || newNode instanceof SVGElement || newNode instanceof Text) {
        res.replaceWith(newNode);
      } else {
        res.data = newNode + '';
      }
    } else {
      (res as JSX.Element).replaceWith(newNode as JSX.Element);
      res = newNode;
    }
  };

  states.forEach((state, index) => {
    state.addStateChangeEvent((val) => onStateChange(val, index));
  });

  return res as JSX.Element;
};

export const Fragment = ({ children }: { children: ComponentChild }) => {
  return children;
};

type RoutesType = {
  path: string;
  element: JSX.Element;
}[];

type RouterProps = {
  routes: RoutesType;
};

const currentPathname = createState('/');

export const Router = ({ routes }: RouterProps) => {
  const pathname = location.pathname;

  currentPathname(pathname);

  window.addEventListener('popstate', (e) => {
    const newPath = (e.currentTarget as typeof window).location.pathname;
    currentPathname(newPath);
  });

  return reactiveElement(
    (path) => routes.find((item) => item.path === path)?.element || null,
    [currentPathname()]
  );
};

type LinkProps = {
  children: ComponentChild;
  href: string;
};

export const Link = ({ children, href }: LinkProps) => {
  const handleClick = (e: any) => {
    e.preventDefault();
    currentPathname(href);
    window.history.pushState({}, '', href);
  };

  return createElement('a', { onClick: handleClick, href }, children);
};

type IfProps = {
  condition: Reactive<boolean>;
  then: JSX.Element;
  else: JSX.Element;
};

/**
 * replaces first with second
 * either can be arrays or single elements
 */
const elementReplace = (first: JSX.Element | JSX.Element[], second: JSX.Element | JSX.Element[]) => {
  if (Array.isArray(first)) {
    if (Array.isArray(second)) {
      for (let i = 1; i < first.length; i++) {
        first[i].remove();
      }

      first[0].replaceWith(second[0]);

      for (let i = second.length - 1; i > 0; i--) {
        second[0].after(second[i]);
      }
    } else {
      for (let i = 1; i < first.length; i++) {
        first[i].remove();
      }

      first[0].replaceWith(second);
    }
  } else {
    if (Array.isArray(second)) {
      first.replaceWith(second[0]);
      for (let i = second.length - 1; i > 0; i--) {
        second[0].after(second[i]);
      }
    } else {
      first.replaceWith(second);
    }
  }
};

export const If = ({ condition, then, else: elseBranch }: IfProps) => {
  if (Array.isArray(then) && then.length === 0) {
    then = createElement('div', {});
  }

  if (Array.isArray(elseBranch) && elseBranch.length === 0) {
    elseBranch = createElement('div', {});
  }

  condition.addStateChangeEvent((show) => {
    if (show) {
      elementReplace(elseBranch, then);
    } else {
      elementReplace(then, elseBranch);
    }
  });

  return condition.value ? then : elseBranch;
};

type ForItemFn<T> = (item: State<T>, index: State<number>) => ComponentChild;

type ForProps<T> = {
  each: Reactive<T[]>;
  children: ForItemFn<T>;
};

export const For = <T>({ each, children }: ForProps<T>) => {
  const elFn = (children as unknown as ForItemFn<T>[])[0];
  let info: [JSX.Element | Text | SVGElement, State<T> | null, State<number> | null][] = [];

  function valueToElement(val: ComponentChild) {
    if (val instanceof HTMLElement) return val;
    const text = document.createElement('span');
    text.innerText = val?.toString();
    return text;
  }

  for (let i = 0; i < each.value.length; i++) {
    const item = each.value[i];

    const indexState = createState(i);
    const itemState = createState(item);
    const res = elFn(itemState, indexState);
    const el = valueToElement(res);
    info.push([el, itemState, indexState]);
  }

  if (each.value.length === 0) {
    info.push([document.createElement('div'), null, null]);
  }

  each.addStateChangeEvent((val) => {
    if (val.length === 0) {
      const el = document.createElement('div');

      while (info.length > 1) {
        const el = info.pop()!;
        el[0].remove();
      }

      (info[0][0] as unknown as HTMLElement).replaceWith(el);
      info[0] = [el, null, null];

      return;
    }

    for (let i = 0; i < val.length; i++) {
      if (i < info.length) {
        const valState = info[i][1];
        const indexState = info[i][2];

        if (valState !== null && indexState !== null) {
          if (valState().value !== val[i]) valState(val[i]);
          if (indexState().value !== i) indexState(i);
          continue;
        }

        const newIndexState = createState(i);
        const newValState = createState(val[i]);
        const el = valueToElement(elFn(newValState, newIndexState));
        info[i][0].replaceWith(el);
        info[i] = [el, newValState, newIndexState];

        continue;
      }

      const newIndexState = createState(i);
      const newValState = createState(val[i]);
      const el = valueToElement(elFn(newValState, newIndexState));
      info[i - 1][0].after(el);
      info.push([el, newValState, newIndexState]);
    }

    while (info.length > val.length) {
      const elInfo = info.pop()!;
      elInfo[0].remove();
    }
  });

  return info.map((item) => item[0]) as unknown as JSX.Element;
};

export const createElement = (
  tag: string | ComponentFactory,
  attrs: ComponentAttributes,
  ...children: ComponentChild[]
) => {
  if (typeof tag === 'function') return tag({ ...attrs, children } as BaseProps);
  const isSvg = isSvgTag(tag);
  const element = isSvg
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  if (attrs) {
    if (attrs.style && typeof attrs.style === 'object') {
      if (attrs.style instanceof Reactive) {
        const reactiveObj = attrs.style;
        reactiveObj.addStateChangeEvent((newVal) => {
          setElementStyle(element, newVal as Partial<CSSStyleDeclaration>);
        });
        setElementStyle(element, (attrs.style as Reactive<any>).value as Partial<CSSStyleDeclaration>);
      } else {
        setElementStyle(element, attrs.style as Partial<CSSStyleDeclaration>);
      }
      delete attrs.style;
    }
    for (let [name, value] of Object.entries(attrs)) {
      if (name === 'ref') {
        (value as unknown as Reactive<any>).distributeNewState(element);
      } else if (value instanceof Reactive) {
        element.setAttribute(name, value.value);
        const effect = (newVal: any) => {
          element.setAttribute(name, newVal);
        };
        value.addStateChangeEvent(effect);
      } else if (name.startsWith('on')) {
        if (name === 'onChange') name = 'onInput';
        const finalName = name.replace(/Capture$/, '');
        const useCapture = name !== finalName;
        const eventName = finalName.toLowerCase().substring(2);
        if (value && typeof value === 'function') {
          element.addEventListener(eventName, value as EventListenerOrEventListenerObject, useCapture);
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
