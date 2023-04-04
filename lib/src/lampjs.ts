import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from './types';
import { isSvgTag, applyChildren, setElementStyle } from './util';

type Listener = {
  event: EventListenerOrEventListenerObject;
  name: string;
  useCapture: boolean;
};

const eventListeners = new Map<string, Listener[]>();
const stateListeners = new Map<string, ExtendId<JSX.Element>[]>();
let mountEvents: (() => void)[] = [];

const uuid = () => crypto.randomUUID();

export const mount = (root: HTMLElement | null, el: JSX.Element) => {
  if (!root || !el) return;

  root.appendChild(el);

  mountEvents.forEach((event) => event());
  mountEvents = [];
};

type Builder<T> = (value: T) => [JSX.Element, ReturnType<typeof createState<any>>[]];

const removeStates = <T>(states: ReturnType<typeof createState<T>>[]) => {
  states.forEach((state) => {
    stateListeners.delete(state().getStateId());
  });
};

const getStateEl = <T>(val: T, id: string, builder?: Builder<T>) => {
  if (builder) {
    const [builderEl, states] = builder(val);

    removeStates(states);

    const el = builderEl as ExtendId<JSX.Element>;
    el.stateId = id;
    el.elId = uuid();
    return el;
  } else {
    const node = document.createElement('span') as ExtendId<HTMLElement>;
    node.innerHTML = val + '';
    node.stateId = id;
    node.elId = uuid();
    return node;
  }
};

export type stateObj<T> = {
  el: () => JSX.Element;
  applyDep: (dep: () => void) => void;
  getStateId: () => string;
  value: T;
};

export const onPageMount = (cb: () => void) => {
  mountEvents.push(cb);
};

const replaceStateNode = (from: ExtendId<JSX.Element>, to: ExtendId<JSX.Element>, id?: string) => {
  const stateRefs = stateListeners.get(id ? id : from.stateId);
  let index: number | null = null;
  stateRefs?.forEach((ref, i) => {
    if (ref.elId == from.elId) {
      index = i;
    }
  });

  if (index !== null) {
    if (!stateRefs) {
      stateListeners.set(from.stateId, [to]);
    } else {
      stateRefs[index] = to;
      stateListeners.set(from.stateId, stateRefs);
    }
  }
};

type StateChangeEvent<T> = Event & { value: T };

type ExtendId<T> = T extends {} ? T & { stateId: string; elId: string } : T;

const cloneNode = (el: ExtendId<JSX.Element>, id?: string) => {
  const events = eventListeners.get(id ? id : el.elId);
  const clone = el.cloneNode(false) as ExtendId<JSX.Element>;
  clone.elId = id ? id : el.elId;
  clone.stateId = el.stateId;
  replaceStateNode(el, clone);
  if (events) {
    events.forEach((event) => {
      clone.addEventListener(event.name, event.event, event.useCapture);
    });
  }
  el.childNodes.forEach((node) => {
    const nodeClone = cloneNode(node as ExtendId<JSX.Element>);
    clone.appendChild(nodeClone);
  });
  return clone as JSX.Element;
};

export const createState = <T>(value: T, builder?: Builder<T>) => {
  let currentValue = value;
  let builderCb: Builder<T> | undefined = builder;
  let refNode: ExtendId<HTMLElement | JSX.Element>;
  let deps: (() => void)[] = [];
  const id = uuid();

  const handleStateChangeEvent = (e: Event) => stateChangeEventCb(e, builderCb);

  const stateChangeEventCb = (e: Event, _builder?: Builder<T>) => {
    const evt = e as StateChangeEvent<T>;
    const el = getStateEl(evt.value, id, builder);
    if (!el.addEventListener) return;
    if (evt.currentTarget) {
      el.elId = (evt.currentTarget as ExtendId<JSX.Element>).elId;
      evt.currentTarget.removeEventListener('state-change', handleStateChangeEvent);
      replaceStateNode(evt.currentTarget as ExtendId<JSX.Element>, el, id);
      el.addEventListener('state-change', handleStateChangeEvent);
      (evt.currentTarget as ExtendId<JSX.Element>).replaceWith(el);
    }
  };

  const applyDep = (dep: () => void) => {
    deps.push(dep);
  };

  const updateCb = (newValue?: T | ((val: T) => T)) => {
    if (newValue !== undefined) {
      if (typeof newValue === 'function') {
        const updateCb = newValue as (val: T) => T;
        currentValue = updateCb(currentValue);
      } else {
        currentValue = newValue;
      }

      refNode = getStateEl(currentValue, id, builderCb);

      console.log(stateListeners);

      const eventsToDispatch = stateListeners.get(id);
      if (eventsToDispatch !== undefined) {
        eventsToDispatch.forEach((node) => {
          const event = new Event('state-change') as StateChangeEvent<T>;
          event.value = currentValue;
          node.dispatchEvent(event);
        });
      }

      deps.forEach((dep) => {
        dep();
      });
    } else if (!refNode) {
      refNode = getStateEl(currentValue, id, builderCb);
    }

    const addToStateNodes = (node: ExtendId<JSX.Element>) => {
      const nodes = [node];
      const elements = stateListeners.get(id);
      if (elements === undefined) {
        console.log([...stateListeners.keys()], id);
        stateListeners.set(id, nodes);
      } else {
        console.log([...stateListeners.keys()], id);
        stateListeners.set(id, [...elements, node]);
      }
    };

    const getElNode = () => {
      const elId = uuid();
      eventListeners.set(elId, [
        {
          event: handleStateChangeEvent,
          name: 'state-change',
          useCapture: false
        }
      ]);
      const clone = cloneNode(refNode, elId) as ExtendId<JSX.Element>;
      clone.stateId = id;
      clone.elId = elId;
      addToStateNodes(clone);
      clone.addEventListener('state-change', handleStateChangeEvent);
      return clone;
    };

    const getId = () => id;

    return {
      el: getElNode,
      value: currentValue,
      applyDep,
      getStateId: getId
    } as stateObj<T>;
  };
  updateCb(value);
  return updateCb;
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

export const createAsyncCall = <T>(url: string, requestInit?: RequestInit) => {
  const data: asyncCallState<T> = {
    loading: true,
    data: null
  };
  return (cb: (val: typeof data) => void, parser?: ((...args: any[]) => any) | null) => {
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
      .catch((err) => {
        console.error(err);
        data.loading = false;
        data.data = null;
        cb(data);
      });
  };
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
  const element = (
    isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag)
  ) as ExtendId<JSX.Element>;
  element.elId = uuid();
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
      if (['textarea', 'input'].includes(tag) && name === 'value') {
        const state = value as (val?: any) => stateObj<any>;
        const update = () => {
          (element as ExtendId<HTMLInputElement>).value = state().value;
        };
        state().applyDep(update);
        update();
      } else if (
        ['input', 'button', 'optgroup', 'option', 'select', 'textarea'].includes(tag) &&
        name === 'disabled'
      ) {
        if (typeof value === 'boolean') {
          (element as ExtendId<HTMLButtonElement | HTMLInputElement>).disabled = value;
        } else {
          const state = value as (val?: any) => stateObj<any>;
          const update = () => {
            (element as ExtendId<HTMLButtonElement | HTMLInputElement>).disabled = state().value;
          };
          state().applyDep(update);
          update();
        }
      } else if (name.startsWith('on')) {
        if (name === 'onChange') {
          name = 'onInput';
        }
        const finalName = name.replace(/Capture$/, '');
        const useCapture = name !== finalName;
        const eventName = finalName.toLowerCase().substring(2);
        if (value && typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
          const listeners = eventListeners.get(element.elId);
          if (!listeners) {
            eventListeners.set(element.elId, [
              { event: value as EventListenerOrEventListenerObject, name: eventName, useCapture }
            ]);
          } else {
            eventListeners.set(element.elId, [
              ...listeners,
              { event: value as EventListenerOrEventListenerObject, name: eventName, useCapture }
            ]);
          }
          element.addEventListener(eventName, value as EventListenerOrEventListenerObject, useCapture);
        }
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
