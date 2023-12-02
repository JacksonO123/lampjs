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
    if (elementIsNode(element, child)) {
      element.appendChild(child);
    }
  } else if (typeof child === 'object') {
    if (child && child instanceof Reactive) {
      const node = document.createTextNode(child.value.toString());
      child.addStateChangeEvent((val) => {
        node.textContent = val.toString();
      });
      if (elementIsNode(element)) {
        element.appendChild(node);
      }
    }
  } else if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
    if (elementIsNode(element)) {
      element.appendChild(document.createTextNode(child.toString()));
    }
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
const createEffect = (cb, deps) => {
  if (deps.length === 0);
  deps.forEach((dep) => {
    dep.addStateChangeEvent(cb);
  });
};
const isState = (val) => {
  return val instanceof Function ? val() instanceof Reactive : false;
};
const getStateValue = (val) => {
  if (isState(val)) return val.value;
  return val;
};
const compChildIsEl = (element) => {
  return (
    element instanceof HTMLElement ||
    element instanceof SVGElement ||
    element instanceof Text ||
    typeof element === 'string'
  );
};
const reactiveElement = (fn, states) => {
  const values = states.map((s) => s.value);
  let res = fn(...values);
  if (
    (Array.isArray(res) && !res.reduce((acc, curr) => acc && compChildIsEl(curr), true)) ||
    (!Array.isArray(res) && !compChildIsEl(res))
  ) {
    res = document.createTextNode(res + '');
  }
  const onStateChange = (val, index) => {
    values[index] = val;
    const newNode = fn(...values);
    if (!res || !newNode) return;
    if (res instanceof Text) {
      if (newNode instanceof HTMLElement || newNode instanceof SVGElement || newNode instanceof Text) {
        res.replaceWith(newNode);
      } else {
        res.data = newNode + '';
      }
    } else {
      if (elementIsNode(res, newNode)) {
        elementReplace(res, newNode);
        res = newNode;
      }
    }
  };
  states.forEach((state, index) => {
    state.addStateChangeEvent((val) => onStateChange(val, index));
  });
  return res;
};
const page404 = () => {
  return createElement('span', {}, ['404 page not found']);
};
const trimPath = (path) => {
  return path.trim().replace(/^\/*/, '').replace(/\/*$/g, '');
};
const validChild = (child) => {
  return (!Array.isArray(child) && child !== null) || (Array.isArray(child) && child.length !== 0);
};
const getRouteElement = (path, pathAcc, data) => {
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
class RouteData {
  constructor(path, element, nested) {
    __publicField(this, 'path');
    __publicField(this, 'element');
    __publicField(this, 'nested');
    this.path = path;
    this.element = element;
    this.nested = nested;
  }
}
const Router$2 = (props) => {
  const { children, onRouteChange } = props;
  const pathname = location.pathname;
  currentPathname(pathname);
  window.addEventListener('popstate', (e) => {
    const newPath = e.currentTarget.location.pathname;
    currentPathname(newPath);
  });
  const handleNewRoute = (path) => {
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        if (children[i] instanceof RouteData) {
          const el = getRouteElement(path, '/', children[i]);
          if (validChild(el)) return el;
        }
      }
      return page404();
    }
    if (children instanceof RouteData) {
      const el = getRouteElement(path, '/', children);
      if (validChild(el)) return el;
    }
    return page404();
  };
  if (onRouteChange) {
    createEffect(() => {
      const el = handleNewRoute(currentPathname().value);
      onRouteChange(el);
    }, [currentPathname()]);
    return handleNewRoute(currentPathname().value);
  }
  return reactiveElement(handleNewRoute, [currentPathname()]);
};
const Route = ({ path, children }) => {
  const nested = [];
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
      children = [];
    }
  }
  return new RouteData(path, children, nested);
};
const Link$1 = ({ children, href }) => {
  const handleClick = (e) => {
    e.preventDefault();
    const hrefVal = isState(href) ? href.value : href;
    currentPathname(hrefVal);
    window.history.pushState({}, '', hrefVal);
  };
  return createElement('a', { onClick: handleClick, href: getStateValue(href) }, children);
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
const elementIsNode = (...el) => {
  return el.reduce(
    (acc, curr) => acc && (curr instanceof HTMLElement || curr instanceof SVGElement || curr instanceof Text),
    true
  );
};
const createElement = (tag, attrs, ...children) => {
  if (typeof tag === 'function')
    return tag({ ...attrs, children: children.length === 1 ? children[0] : children });
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
const mountSSR = async (newDom) => {
  if (newDom instanceof Promise) {
    newDom = await newDom;
  }
  const target = document.body;
  newDom.childNodes.forEach((node) => {
    if (node.nodeName === 'BODY') {
      const cacheData = document.getElementById('_LAMPJS_DATA_');
      target.replaceWith(node);
      if (cacheData) document.body.appendChild(cacheData);
    }
    if (node.nodeName === 'HEAD') {
      const preservedElements = [];
      const devScript = document.createElement('script');
      devScript.type = 'module';
      {
        devScript.src = '/index.js';
        document.addEventListener('DOMContentLoaded', () => {
          const children = Array.from(document.head.childNodes);
          children.forEach((item) => {
            if (
              (item instanceof HTMLStyleElement && item.type === 'text/css') ||
              (item instanceof HTMLLinkElement && item.rel === 'stylesheet') ||
              item instanceof HTMLTitleElement
            ) {
              preservedElements.push(item);
            }
          });
          document.head.replaceWith(node);
          document.head.appendChild(devScript);
          preservedElements.forEach((el) => document.head.appendChild(el));
        });
      }
    }
  });
};
function Router$1(props, options, cache) {
  const { children } = props;
  const replacePage = (newPage) => {
    console.log(newPage.cloneNode(true));
    mountSSR(newPage);
  };
  return createElement(
    Router$2,
    { onRouteChange: replacePage },
    ...(Array.isArray(children) ? children : [children])
  );
}
function Link({ children, href }, options, cache) {
  return createElement(Link$1, { href }, ...(Array.isArray(children) ? children : [children]));
}
const Counter = () => {
  const count = createState(0);
  return /* @__PURE__ */ createElement(
    'button',
    { onClick: () => count((prev) => prev + 1) },
    'Count is ',
    count()
  );
};
const App = () => {
  return /* @__PURE__ */ createElement(
    'div',
    { class: 'root' },
    /* @__PURE__ */ createElement('img', {
      src: '/lamp.svg',
      alt: 'LampJs Icon'
    }),
    /* @__PURE__ */ createElement('h1', null, 'LampJs'),
    /* @__PURE__ */ createElement('span', null, 'A powerful, lightweight JS framework'),
    /* @__PURE__ */ createElement(Counter, null),
    /* @__PURE__ */ createElement(Link, { href: '/about' }, 'about')
  );
};
const About = () => {
  return /* @__PURE__ */ createElement(
    'div',
    { class: 'root' },
    /* @__PURE__ */ createElement('h1', null, 'about'),
    /* @__PURE__ */ createElement(Link, { href: '/' }, 'home')
  );
};
const Layout = ({ children }) => {
  return /* @__PURE__ */ createElement(
    'html',
    { lang: 'en' },
    /* @__PURE__ */ createElement(
      'head',
      null,
      /* @__PURE__ */ createElement('meta', {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0'
      }),
      /* @__PURE__ */ createElement('meta', {
        name: 'description',
        content: 'Server side rendering !!!'
      }),
      /* @__PURE__ */ createElement('title', null, 'test')
    ),
    /* @__PURE__ */ createElement('body', null, children)
  );
};
const Router = () => {
  return /* @__PURE__ */ createElement(
    Router$1,
    null,
    /* @__PURE__ */ createElement(
      Route,
      { path: '/' },
      /* @__PURE__ */ createElement(Layout, null, /* @__PURE__ */ createElement(App, null))
    ),
    /* @__PURE__ */ createElement(
      Route,
      { path: '/about' },
      /* @__PURE__ */ createElement(Layout, null, /* @__PURE__ */ createElement(About, null))
    )
  );
};
mountSSR(/* @__PURE__ */ createElement(Router, null));
