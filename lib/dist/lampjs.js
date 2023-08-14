import { isSvgTag, applyChildren, setElementStyle } from "./util";
let mountEvents = [];
export const mount = (root, el) => {
    if (!root || !el)
        return;
    function mountEl(el) {
        if (Array.isArray(el)) {
            el.forEach((newEl) => mountEl(newEl));
        }
        else {
            root.appendChild(el);
        }
    }
    mountEl(el);
    mountEvents.forEach((event) => event());
    mountEvents = [];
};
export class StateData {
    isState = true;
    onStateChange;
    value;
    constructor(value) {
        this.value = value;
        this.onStateChange = [];
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
}
export const onPageMount = (cb) => {
    mountEvents.push(cb);
};
export const createState = (value) => {
    const effects = [];
    let currentState = new StateData(value);
    const updateCb = (newState) => {
        if (newState !== undefined) {
            const newStateVal = newState instanceof Function
                ? newState(currentState.value)
                : newState;
            currentState.distributeNewState(newStateVal);
            effects.forEach((effect) => effect());
        }
        return currentState;
    };
    return updateCb;
};
export const createEffect = (cb, deps) => {
    if (deps.length === 0) {
        mountEvents.push(cb);
    }
    deps.forEach((dep) => {
        dep.addStateChangeEvent(cb);
    });
};
export const reactive = (fn, states) => {
    const values = states.map((s) => s.value);
    let res = fn(...values);
    const onStateChange = (val, index) => {
        values[index] = val;
        const newNode = fn(...values);
        if (!res || !newNode)
            return;
        res.replaceWith(newNode);
        res = newNode;
    };
    states.forEach((state, index) => {
        state.addStateChangeEvent((val) => onStateChange(val, index));
    });
    return res;
};
export const Fragment = ({ children }) => {
    return children;
};
const currentPathname = createState("/");
export const Router = ({ routes }) => {
    const pathname = location.pathname;
    currentPathname(pathname);
    return reactive((path) => routes.find((item) => item.path === path)?.element || null, [currentPathname()]);
};
export const Link = ({ children, href }) => {
    const handleClick = (e) => {
        e.preventDefault();
        currentPathname(href);
        window.history.pushState({}, "", href);
    };
    return createElement("a", { onClick: handleClick, href }, children);
};
export const For = ({ each, children, ...others }) => {
    const elFn = children[0];
    return reactive((arr) => createElement("div", 
    // @ts-ignore
    { ...others }, ...arr.map((item, index) => elFn(item, index))), [each]);
};
const xlinkNS = "http://www.w3.org/1999/xlink";
export const createElement = (tag, attrs, ...children) => {
    if (typeof tag === "function")
        return tag(Object.assign(Object.assign({}, attrs), { children }));
    const isSvg = isSvgTag(tag);
    const element = isSvg
        ? document.createElementNS("http://www.w3.org/2000/svg", tag)
        : document.createElement(tag);
    if (attrs) {
        if (attrs.style &&
            typeof attrs.style !== "string" &&
            typeof attrs.style !== "number" &&
            typeof attrs.style !== "boolean") {
            setElementStyle(element, attrs.style);
            delete attrs.style;
        }
        for (let name of Object.keys(attrs)) {
            const value = attrs[name];
            // @ts-ignore
            if (name === "ref") {
                // @ts-ignore
                value(element);
                // @ts-ignore
            }
            else if (attrs[name].isState === true) {
                // @ts-ignore
                const value = attrs[name];
                if (tag === "input" && name === "checked") {
                    element.checked = value.value;
                    const effect = () => {
                        element.checked = value.value;
                    };
                    value.addStateChangeEvent(effect);
                }
                else if (["textarea", "input"].includes(tag) && name === "value") {
                    element.value =
                        value.value;
                    const effect = () => {
                        element.value =
                            value.value;
                    };
                    value.addStateChangeEvent(effect);
                }
                else if ([
                    "input",
                    "button",
                    "optgroup",
                    "option",
                    "select",
                    "textarea",
                ].includes(tag) &&
                    name === "disabled") {
                    element.disabled = value.value;
                    const effect = () => {
                        element.disabled = value.value;
                    };
                    value.addStateChangeEvent(effect);
                }
            }
            else if (name.startsWith("on")) {
                if (name === "onChange") {
                    name = "onInput";
                }
                const finalName = name.replace(/Capture$/, "");
                const useCapture = name !== finalName;
                const eventName = finalName.toLowerCase().substring(2);
                if (value &&
                    typeof value !== "string" &&
                    typeof value !== "number" &&
                    typeof value !== "boolean") {
                    element.addEventListener(eventName, value, useCapture);
                }
            }
            else if (isSvg && name.startsWith("xlink:")) {
                if (value && typeof value !== "number" && typeof value !== "boolean") {
                    element.setAttributeNS(xlinkNS, name, value);
                }
            }
            else if (value === true) {
                element.setAttribute(name, name);
            }
            else if (value || value === 0) {
                element.setAttribute(name, value.toString());
            }
        }
    }
    applyChildren(element, children);
    return element;
};
