import type {
  JSX,
  ComponentChild,
  ComponentFactory,
  ComponentAttributes,
} from "./types";
import { isSvgTag, applyChildren, setElementStyle } from "./util";

let mountEvents: (() => void)[] = [];

export const mount = (
  root: HTMLElement | null,
  el: JSX.Element | JSX.Element[]
) => {
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

export class StateData<T> {
  isState = true;
  addEffect: (effect: () => void) => void;
  private onStateChange: ((val: T) => void)[];
  value: T;
  constructor(value: T, addEffect: (effect: () => void) => void) {
    this.value = value;
    this.onStateChange = [];
    this.addEffect = addEffect;
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

const initState = <T>(value: T, addEffect: (effect: () => void) => void) => {
  return new StateData(value, addEffect);
};

export const createState = <T>(value: T) => {
  const effects: (() => void)[] = [];

  const addEffect = (effect: () => void) => {
    effects.push(effect);
  };

  let currentState = initState(value, addEffect);

  const updateCb = (newState?: T | ((val: T) => T)) => {
    if (newState !== undefined) {
      const newStateVal =
        newState instanceof Function
          ? (newState as (val: T) => T)(currentState.value)
          : newState;
      currentState.distributeNewState(newStateVal);
      effects.forEach((effect) => effect());
    }

    return currentState;
  };

  return updateCb;
};

export type Reactive<T> = ReturnType<typeof createState<T>>;

export const createEffect = <T extends StateData<any>>(
  cb: () => void,
  deps: T[]
) => {
  if (deps.length === 0) {
    mountEvents.push(cb);
  }

  deps.forEach((dep) => {
    dep.addEffect(cb);
  });
};

export type asyncCallState<T> = {
  loading: boolean;
  data: T | null;
};

type InnerStateFromArray<T extends readonly StateData<any>[]> = {
  [K in keyof T]: T[K] extends StateData<infer U> ? U : never;
};

export const reactive = <T extends readonly StateData<any>[]>(
  fn: (...val: InnerStateFromArray<T>) => JSX.Element | null,
  states: T
): JSX.Element | null => {
  const values = states.map((s) => s.value);
  let res = fn(...(values as InnerStateFromArray<T>));

  const onStateChange = (val: unknown, index: number) => {
    values[index] = val;
    const newNode = fn(...(values as InnerStateFromArray<T>));
    if (!res || !newNode) return;
    res.replaceWith(newNode);
    res = newNode;
  };

  states.forEach((state, index) => {
    state.addStateChangeEvent((val) => onStateChange(val, index));
  });

  return res;
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

const currentPathname = createState("/");

export const Router = ({ routes }: RouterProps) => {
  const pathname = location.pathname;

  currentPathname(pathname);

  return reactive(
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
    window.history.pushState({}, "", href);
  };

  return createElement("a", { onClick: handleClick, href }, children);
};

type ForItemFn<T> = (item: T, index: number) => ComponentChild;

type ForProps<T> = {
  each: StateData<Array<T>>;
  children: ForItemFn<T>;
};

type ForElementAttributes = Omit<JSX.HTMLAttributes, "children">;

export const For = <T>({
  each,
  children,
  ...others
}: ForProps<T> & ForElementAttributes) => {
  const elFn = (children as unknown as ForItemFn<T>[])[0];

  return reactive(
    (arr) =>
      createElement(
        "div",
        // @ts-ignore
        { ...others },
        ...arr.map((item, index) => elFn(item, index))
      ),
    [each]
  );
};

const xlinkNS = "http://www.w3.org/1999/xlink";
export const createElement = (
  tag: string | ComponentFactory,
  attrs: ComponentAttributes,
  ...children: ComponentChild[]
) => {
  if (typeof tag === "function")
    return tag(Object.assign(Object.assign({}, attrs), { children }));
  const isSvg = isSvgTag(tag);
  const element = isSvg
    ? document.createElementNS("http://www.w3.org/2000/svg", tag)
    : document.createElement(tag);
  if (attrs) {
    if (
      attrs.style &&
      typeof attrs.style !== "string" &&
      typeof attrs.style !== "number" &&
      typeof attrs.style !== "boolean"
    ) {
      setElementStyle(element, attrs.style as Partial<CSSStyleDeclaration>);
      delete attrs.style;
    }
    for (let name of Object.keys(attrs)) {
      const value = attrs[name];
      // @ts-ignore
      if (name === "ref") {
        // @ts-ignore
        value(element);
        // @ts-ignore
      } else if (attrs[name].isState === true) {
        // @ts-ignore
        const value = attrs[name] as StateData<any>;
        if (tag === "input" && name === "checked") {
          (element as HTMLInputElement).checked = value.value;
          const effect = () => {
            (element as HTMLInputElement).checked = value.value;
          };
          value.addEffect(effect);
        } else if (["textarea", "input"].includes(tag) && name === "value") {
          (element as HTMLTextAreaElement | HTMLInputElement).value =
            value.value;
          const effect = () => {
            (element as HTMLTextAreaElement | HTMLInputElement).value =
              value.value;
          };
          value.addEffect(effect);
        } else if (
          [
            "input",
            "button",
            "optgroup",
            "option",
            "select",
            "textarea",
          ].includes(tag) &&
          name === "disabled"
        ) {
          type DisableableType =
            | HTMLInputElement
            | HTMLButtonElement
            | HTMLOptGroupElement
            | HTMLOptionElement
            | HTMLSelectElement
            | HTMLTextAreaElement;
          (element as DisableableType).disabled = value.value;
          const effect = () => {
            (element as DisableableType).disabled = value.value;
          };
          value.addEffect(effect);
        }
      } else if (name.startsWith("on")) {
        if (name === "onChange") {
          name = "onInput";
        }
        const finalName = name.replace(/Capture$/, "");
        const useCapture = name !== finalName;
        const eventName = finalName.toLowerCase().substring(2);
        if (
          value &&
          typeof value !== "string" &&
          typeof value !== "number" &&
          typeof value !== "boolean"
        ) {
          element.addEventListener(
            eventName,
            value as EventListenerOrEventListenerObject,
            useCapture
          );
        }
      } else if (isSvg && name.startsWith("xlink:")) {
        if (value && typeof value !== "number" && typeof value !== "boolean") {
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
