import type {
  JSX,
  ComponentChild,
  ComponentAttributes,
  BaseProps,
  SuspenseFn,
  FetchResponse,
  ResponseData,
  ValueFromResponse,
  ComponentFactory
} from './types';
import { isSvgTag, applyChildren, setElementStyle, applyChild } from './util';

let mountEvents: (() => void)[] = [];

export const mount = (root: HTMLElement | null, el: JSX.Element | JSX.Element[]) => {
  if (!root || !el) return;

  if (Array.isArray(el)) {
    applyChildren(root, el);
  } else {
    applyChild(root, el);
  }

  mountEvents.forEach((event) => event());
  mountEvents = [];
};

export class Reactive<T> {
  private onStateChange: ((val: T) => void)[];
  value: T;
  onTerminate: null | (() => void);
  constructor(value: T) {
    this.value = value;
    this.onStateChange = [];
    this.onTerminate = null;
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
  terminate() {
    this.onTerminate?.();
    this.onStateChange = [];
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

  res().onTerminate = () => {
    states.forEach((state) => {
      state.terminate();
    });
  };

  return res;
};

const compChildIsEl = (element: ComponentChild) => {
  return element instanceof HTMLElement || element instanceof SVGElement || element instanceof Text;
};

export const reactiveElement = <T extends readonly Reactive<any>[]>(
  fn: (...val: InnerStateFromArray<T>) => ComponentChild,
  states: T
): JSX.SyncElement | null => {
  const values = states.map((s) => s.value);
  let res: ComponentChild = fn(...(values as InnerStateFromArray<T>));

  if (
    (Array.isArray(res) && !res.reduce((acc, curr) => acc && compChildIsEl(curr), true)) ||
    (!Array.isArray(res) && !compChildIsEl(res))
  ) {
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
      if (elementIsNode(res, newNode)) {
        elementReplace(res as JSX.NodeElements, newNode as JSX.NodeElements);
        res = newNode;
      }
    }
  };

  states.forEach((state, index) => {
    state.addStateChangeEvent((val) => onStateChange(val, index));
  });

  return res as JSX.SyncElement;
};

export const Fragment = ({ children }: { children: ComponentChild }) => {
  return children;
};

const page404 = () => {
  return createElement('span', {}, ['404 page not found']);
};

const trimPath = (path: string) => {
  return path.trim().replace(/^\/*/, '').replace(/\/*$/g, '');
};

const validChild = (child: ComponentChild) => {
  return (!Array.isArray(child) && child !== null) || (Array.isArray(child) && child.length !== 0);
};

const getRouteElement = (path: string, pathAcc: string, data: RouteData): ComponentChild => {
  const dataPath = trimPath(data.path);

  const currentPath = pathAcc + (pathAcc === '/' ? '' : '/') + dataPath;

  if (path === currentPath) {
    return data.element;
  }

  if (dataPath.endsWith('*')) {
    const tempPath = path.replace(pathAcc, '');
    const pathParts = tempPath.split('/');
    const pathPart = pathParts[0];
    const newMatch = dataPath.substring(0, dataPath.length - 1);

    if (pathPart.startsWith(newMatch)) {
      for (let i = 0; i < data.nested.length; i++) {
        const el = getRouteElement(path, pathAcc + (pathAcc === '/' ? '' : '/') + pathPart, data.nested[i]);
        if (validChild(el)) return el;
      }

      const followingPath = path.replace(pathAcc, '');
      if (followingPath.split('/').length === 1) {
        return data.element;
      }
    }

    return null;
  }

  if (path.startsWith(currentPath)) {
    for (let i = 0; i < data.nested.length; i++) {
      const el = getRouteElement(path, currentPath, data.nested[i]);
      if (el !== null) return el;
    }
  }

  return null;
};

const currentPathname = createState('/');

export class RouteData {
  readonly path: string;
  readonly element: ComponentChild;
  readonly nested: RouteData[];
  constructor(path: string, element: ComponentChild, nested: RouteData[]) {
    this.path = path;
    this.element = element;
    this.nested = nested;
  }
}

type RouterPropsJSX = {
  children: JSX.Element | JSX.Element[];
};

type RouterProps = {
  children: RouteData | RouteData[];
};

export const Router = (props: RouterPropsJSX) => {
  const { children } = props as RouterProps;
  const pathname = location.pathname;

  currentPathname(pathname);

  window.addEventListener('popstate', (e) => {
    const newPath = (e.currentTarget as typeof window).location.pathname;
    currentPathname(newPath);
  });

  return reactiveElement(
    (path) => {
      if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
          if (children[i] instanceof RouteData) {
            const el = getRouteElement(path, '/', children[i]);
            if (validChild(el)) return el;
          }
        }

        return page404();
      } else {
        if (children instanceof RouteData) {
          const el = getRouteElement(path, '/', children);
          if (validChild(el)) return el;
        }
      }

      return document.createElement('div');
    },
    [currentPathname()]
  );
};

type RouteProps = {
  path: string;
  children: ComponentChild;
};

export const Route = ({ path, children }: RouteProps) => {
  const nested: RouteData[] = [];

  if (Array.isArray(children)) {
    children = children.filter((child) => {
      if (child instanceof RouteData) {
        nested.push(child);
        return false;
      }

      return true;
    });
  } else {
    if (children instanceof RouteData) {
      nested.push(children);
    }
    children = [];
  }

  return new RouteData(path, children, nested);
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

/**
 * replaces first with second
 * either can be arrays or single elements
 */
const elementReplace = (
  first: JSX.NodeElements | JSX.NodeElements[],
  second: JSX.NodeElements | JSX.NodeElements[]
) => {
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

type IfProps = {
  condition: Reactive<boolean>;
  then: JSX.Element;
  else: JSX.Element;
};

export const If = ({ condition, then, else: elseBranch }: IfProps) => {
  if (Array.isArray(then) && then.length === 0) {
    then = createElement('div', {});
  }

  if (Array.isArray(elseBranch) && elseBranch.length === 0) {
    elseBranch = createElement('div', {});
  }

  condition.addStateChangeEvent((show) => {
    if (elementIsNode(elseBranch, then)) {
      if (show) {
        elementReplace(elseBranch as JSX.NodeElements, then as JSX.NodeElements);
      } else {
        elementReplace(then as JSX.NodeElements, elseBranch as JSX.NodeElements);
      }
    }
  });

  return condition.value ? then : elseBranch;
};

type ForItemFn<T> = (
  item: State<T>,
  index: State<number>,
  cleanup: (...args: Reactive<any>[]) => void
) => ComponentChild;

type ForProps<T> = {
  each: Reactive<T[]>;
  children: ForItemFn<T>;
};

export const For = <T>({ each, children }: ForProps<T>) => {
  let info: [JSX.NodeElements, State<T> | null, State<number> | null][] = [];
  let toTerminate: Record<number, Reactive<any>[]> = {};

  const collectCleanupSignals = (index: number, ...args: Reactive<any>[]) => {
    const terminators = toTerminate[index];
    if (terminators === undefined) {
      toTerminate[index] = [...args];
    } else {
      terminators.push(...args);
    }
  };

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
    const res = children(itemState, indexState, (...args: Reactive<any>[]) =>
      collectCleanupSignals(i, ...args)
    );
    const el = valueToElement(res);
    info.push([el, itemState, indexState]);
  }

  if (each.value.length === 0) {
    info.push([document.createElement('div'), null, null]);
  }

  each.addStateChangeEvent((val) => {
    if (val.length === 0) {
      const el = document.createElement('div');

      Object.values(toTerminate).forEach((terminators) => {
        terminators.forEach((terminator) => terminator.terminate());
      });

      toTerminate = {};

      while (info.length > 1) {
        const el = info.pop()!;
        el[0].remove();
        el[1]!().terminate();
        el[2]!().terminate();
      }

      info[0][0].replaceWith(el);
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
        const el = valueToElement(
          children(newValState, newIndexState, (...args: Reactive<any>[]) =>
            collectCleanupSignals(i, ...args)
          )
        );
        info[i][0].replaceWith(el);
        info[i] = [el, newValState, newIndexState];

        continue;
      }

      const newIndexState = createState(i);
      const newValState = createState(val[i]);
      const el = valueToElement(
        children(newValState, newIndexState, (...args: Reactive<any>[]) => collectCleanupSignals(i, ...args))
      );
      info[i - 1][0].after(el);
      info.push([el, newValState, newIndexState]);
    }

    while (info.length > val.length) {
      const index = info.length - 1;
      const elInfo = info.pop()!;
      elInfo[0].remove();
      elInfo[1]!().terminate();
      elInfo[2]!().terminate();
      toTerminate[index].forEach((terminator) => terminator.terminate());
      toTerminate[index] = [];
    }
  });

  return info.map((item) => item[0]) as unknown as JSX.Element;
};

export class CaseData<T> {
  readonly value: T | undefined;
  readonly children: JSX.Element;
  readonly isDefault: boolean;

  constructor(value: T | undefined, children: JSX.Element, isDefault: boolean) {
    this.value = value;
    this.children = children;
    this.isDefault = Boolean(isDefault);
  }
}

type SwitchPropsJSX<T> = {
  children: JSX.Element | JSX.Element[];
  condition: Reactive<T>;
};

type SwitchProps<T> = {
  children: CaseData<T> | CaseData<T>[];
  condition: Reactive<T>;
};

export const Switch = <T>(props: SwitchPropsJSX<T>) => {
  const { condition, children } = props as SwitchProps<T>;

  const effect = (val: T) => {
    if (Array.isArray(children)) {
      let defaultIndex = -1;

      for (let i = 0; i < children.length; i++) {
        if (children[i].isDefault) defaultIndex = i;
        if (children[i].value === val) {
          return children[i].children;
        }
      }

      if (defaultIndex >= 0) {
        return children[defaultIndex].children;
      } else {
        throw new Error('Switch case not met, expected Default element');
      }
    } else {
      if (children.isDefault) {
        return children.children;
      } else {
        throw new Error('Expected default element for single child Switch element');
      }
    }
  };

  return reactiveElement((val) => effect(val), [condition]);
};

type CaseProps<T> = {
  value?: T;
  children: JSX.Element;
  isDefault?: boolean;
};

export const Case = <T>({ value, children, isDefault = false }: CaseProps<T>) => {
  return new CaseData(value, children, isDefault);
};

export const elementIsNode = (...el: ComponentChild[]) => {
  return el.reduce(
    (acc, curr) => acc && (curr instanceof HTMLElement || curr instanceof SVGElement || curr instanceof Text),
    true
  );
};

export const wait = (el: JSX.Element) => {
  const placeholder = document.createElement('div');

  (async () => {
    const res = await el;

    if (elementIsNode(res)) {
      placeholder.replaceWith(res as Exclude<JSX.SyncElement, JSX.NonNodeElements>);
    }
  })();

  return placeholder;
};

type SuspenseProps<T extends FetchResponse<any> | Promise<any>> = {
  children: T | Promise<any>;
  fallback: JSX.Element;
  render?: SuspenseFn<T>;
  decoder?: (value: ResponseData<ValueFromResponse<T>>) => any;
  suspenseId?: string;
};

export const Suspense = <T extends FetchResponse<any> | Promise<any>>({
  children,
  render,
  fallback,
  decoder,
  suspenseId
}: SuspenseProps<T>) => {
  let elToReplace: JSX.Element | JSX.Element[] = fallback;

  children
    .then((current) => {
      if (decoder) return decoder(current);
      if (current instanceof Response) return current.json();
      return Promise.resolve(current);
    })
    .then(async (val: ValueFromResponse<T>) => {
      const el = render
        ? render(val)
        : !((val as any) instanceof Node)
          ? document.createTextNode(val + '')
          : (val as JSX.NodeElements);

      elementReplace(elToReplace as JSX.NodeElements, el);
    });

  if (suspenseId) {
    const ssrCache = document.getElementById('_LAMPJS_DATA_');
    if (ssrCache) {
      const data: Record<string, string[]> = JSON.parse(ssrCache.innerHTML);

      if (data[suspenseId]) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = data[suspenseId].join('');
        const cachedEl = Array.from(wrapper.childNodes) as HTMLElement[];
        elToReplace = cachedEl;
      }
    }
  }

  return elToReplace;
};

export const createElement = (
  tag: string | ComponentFactory,
  attrs: ComponentAttributes,
  ...children: ComponentChild[]
) => {
  if (typeof tag === 'function')
    return tag({ ...attrs, children: children.length === 1 ? children[0] : children } as BaseProps);
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
        setElementStyle(element, (attrs.style as Reactive<Partial<CSSStyleDeclaration>>).value);
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
