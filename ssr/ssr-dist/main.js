import { mountSSR, createElementSSR, Router as Router$1, Link } from '@jacksonotto/lampjs-ssr';

const createElement = createElementSSR;

// ../lib/dist/lampjs.js
var Reactive = class {
  onStateChange;
  value;
  onTerminate;
  constructor(value) {
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
    this.onTerminate?.();
    this.onStateChange = [];
  }
};
var createState = (value) => {
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
var RouteData = class {
  path;
  element;
  nested;
  constructor(path, element, nested) {
    this.path = path;
    this.element = element;
    this.nested = nested;
  }
};
var Route = (props) => {
  const { path, content, children } = props;
  return new RouteData(path, content, children ? Array.isArray(children) ? children : [children] : []);
};

// src/layouts/Layout.tsx
var Layout = ({ children }) => {
  return /* @__PURE__ */ createElement("html", { lang: "en" }, /* @__PURE__ */ createElement("head", null, /* @__PURE__ */ createElement(
    "meta",
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0"
    }
  ), /* @__PURE__ */ createElement(
    "meta",
    {
      name: "description",
      content: "Server side rendering !!!"
    }
  ), /* @__PURE__ */ createElement("title", null, "test")), /* @__PURE__ */ createElement("body", null, children));
};
var Layout_default = Layout;

// src/components/Counter.tsx
var Counter = () => {
  const count = createState(0);
  return /* @__PURE__ */ createElement("button", { onClick: () => count((prev) => prev + 1) }, "Count is ", count());
};
var Counter_default = Counter;

// src/pages/App.tsx
var App = () => {
  return /* @__PURE__ */ createElement("div", { class: "root" }, /* @__PURE__ */ createElement(
    "img",
    {
      src: "/lamp.svg",
      alt: "LampJs Icon",
      width: "40",
      height: "40"
    }
  ), /* @__PURE__ */ createElement("h1", null, "LampJs SSR 2"), /* @__PURE__ */ createElement("span", null, "A powerful, lightweight JS framework"), /* @__PURE__ */ createElement(Counter_default, null), /* @__PURE__ */ createElement(Link, { href: "/about" }, "about"));
};
var App_default = App;
var About = () => {
  return /* @__PURE__ */ createElement("div", { class: "root" }, /* @__PURE__ */ createElement("h1", null, "about"), /* @__PURE__ */ createElement(Link, { href: "/" }, "home"));
};
var About_default = About;

// src/Router.tsx
var Router = () => {
  return /* @__PURE__ */ createElement(Router$1, null, /* @__PURE__ */ createElement(
    Route,
    {
      path: "/",
      content: () => /* @__PURE__ */ createElement(Layout_default, null, /* @__PURE__ */ createElement(App_default, null))
    }
  ), /* @__PURE__ */ createElement(
    Route,
    {
      path: "/about",
      content: () => /* @__PURE__ */ createElement(Layout_default, null, /* @__PURE__ */ createElement(About_default, null))
    }
  ));
};
var Router_default = Router;

// src/main.tsx
mountSSR(/* @__PURE__ */ createElement(Router_default, null));
var main_default = Router_default;

export { main_default as default };
