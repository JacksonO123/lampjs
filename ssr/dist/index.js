var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value })
    : (obj[key] = value);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== 'symbol' ? key + '' : key, value);
  return value;
};
const isSvgTag = (tag) => {
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
const setElementStyle = (element, style) => {
  let key;
  const keys = Object.keys(style);
  for (key of keys) {
    element.style[key] = style[key];
  }
};
const applyChild = (element, child) => {
  if (child instanceof HTMLElement || child instanceof Text) {
    element.appendChild(child);
  } else if (typeof child === 'object') {
    if (child && child instanceof Reactive) {
      const node = document.createTextNode(child.value.toString());
      child.addStateChangeEvent((val) => {
        node.textContent = val.toString();
      });
      element.appendChild(node);
    }
  } else if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
    element.appendChild(document.createTextNode(child.toString()));
  } else {
    console.warn('Unknown type to append: ', child);
  }
};
const applyChildren = (element, children) => {
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
class Reactive {
  constructor(value) {
    __publicField(this, 'onStateChange');
    __publicField(this, 'value');
    __publicField(this, 'onTerminate');
    this.value = value;
    this.onStateChange = [];
    this.onTerminate = null;
  }
  toString() {
    return this.value;
  }
  addStateChangeEvent(event) {
    this.onStateChange.push(event);
  }
  distributeNewState(data) {
    this.value = data;
    this.onStateChange.forEach((fn) => fn(data));
  }
  terminate() {
    var _a;
    (_a = this.onTerminate) == null ? void 0 : _a.call(this);
    this.onStateChange = [];
  }
}
const createState = (value) => {
  let currentState = new Reactive(value);
  const updateCb = (newState) => {
    if (newState !== void 0) {
      const newStateVal = newState instanceof Function ? newState(currentState.value) : newState;
      currentState.distributeNewState(newStateVal);
    }
    return currentState;
  };
  return updateCb;
};
const elementReplace = (first, second) => {
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
const Suspense = ({ children, render, fallback, decoder }) => {
  console.log('in suspense', children);
  children[0]
    .then((current) => {
      if (decoder) return decoder(current);
      if (current instanceof Response) return current.json();
      return Promise.resolve(current);
    })
    .then(async (val) => {
      let newValue = val;
      if (render !== void 0) {
        newValue = render(val);
      }
      if (!(newValue instanceof Node) && !Array.isArray(newValue)) {
        newValue = document.createTextNode(val + '');
      }
      elementReplace(fallback, newValue);
    });
  return fallback;
};
const createElement = (tag, attrs, ...children) => {
  if (typeof tag === 'function') return tag({ ...attrs, children });
  const isSvg = isSvgTag(tag);
  const element = isSvg
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  if (attrs) {
    if (attrs.style && typeof attrs.style === 'object') {
      if (attrs.style instanceof Reactive) {
        const reactiveObj = attrs.style;
        reactiveObj.addStateChangeEvent((newVal) => {
          setElementStyle(element, newVal);
        });
        setElementStyle(element, attrs.style.value);
      } else {
        setElementStyle(element, attrs.style);
      }
      delete attrs.style;
    }
    for (let [name, value] of Object.entries(attrs)) {
      if (name === 'ref') {
        value.distributeNewState(element);
      } else if (value instanceof Reactive) {
        element.setAttribute(name, value.value);
        const effect = (newVal) => {
          element.setAttribute(name, newVal);
        };
        value.addStateChangeEvent(effect);
      } else if (name.startsWith('on')) {
        if (name === 'onChange') name = 'onInput';
        const finalName = name.replace(/Capture$/, '');
        const useCapture = name !== finalName;
        const eventName = finalName.toLowerCase().substring(2);
        if (value && typeof value === 'function') {
          element.addEventListener(eventName, value, useCapture);
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
const mountSSR = async (target, newDom) => {
  if (newDom instanceof Promise) {
    newDom = await newDom;
  }
  newDom.childNodes.forEach((node) => {
    if (node.nodeName === 'BODY') {
      target.replaceWith(node);
    }
  });
};
const ServerSuspense = async ({
  children,
  fallback,
  decoder,
  render
  // waitServer,
}) => {
  console.log('before suspense', children);
  const el = createElement(Suspense, { children, fallback, render, decoder });
  console.log('after suspense', el);
  return el;
};
const Test = ({ onClick }) => {
  const state = createState(0);
  const handleClick = () => {
    state((prev) => prev + 1);
    onClick();
  };
  return /* @__PURE__ */ createElement(
    'div',
    null,
    /* @__PURE__ */ createElement('button', { onClick: handleClick }, 'test ', state())
  );
};
const Async = async () => {
  const res = await fetch('http://localhost:3001');
  const data = await res.json();
  console.log(data);
  return /* @__PURE__ */ createElement('div', null, 'in async');
};
const App = () => {
  const handleClick = () => {
    console.log('clicked');
  };
  return /* @__PURE__ */ createElement(
    'html',
    null,
    /* @__PURE__ */ createElement(
      'head',
      null,
      /* @__PURE__ */ createElement('meta', {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0'
      }),
      /* @__PURE__ */ createElement('title', null, 'test')
    ),
    /* @__PURE__ */ createElement(
      'body',
      null,
      'in body pt2.3',
      /* @__PURE__ */ createElement('br', null),
      /* @__PURE__ */ createElement(Test, { onClick: handleClick }),
      /* @__PURE__ */ createElement(
        ServerSuspense,
        { fallback: /* @__PURE__ */ createElement('span', null, 'waiting') },
        /* @__PURE__ */ createElement(Async, null)
      )
    )
  );
};
mountSSR(document.body, /* @__PURE__ */ createElement(App, null));
