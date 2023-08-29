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
export class Reactive {
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
    let currentState = new Reactive(value);
    const updateCb = (newState) => {
        if (newState !== undefined) {
            const newStateVal = newState instanceof Function
                ? newState(currentState.value)
                : newState;
            currentState.distributeNewState(newStateVal);
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
    window.addEventListener("popstate", (e) => {
        const newPath = e.currentTarget.location.pathname;
        currentPathname(newPath);
    });
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
/**
 * replaces first with second
 * either can be arrays or single elements
 */
const ifReplace = (first, second) => {
    if (Array.isArray(first)) {
        if (Array.isArray(second)) {
            for (let i = 1; i < first.length; i++) {
                first[i].remove();
            }
            first[0].replaceWith(second[0]);
            for (let i = second.length - 1; i > 0; i--) {
                second[0].after(second[i]);
            }
        }
        else {
            for (let i = 1; i < first.length; i++) {
                first[i].remove();
            }
            first[0].replaceWith(second);
        }
    }
    else {
        if (Array.isArray(second)) {
            first.replaceWith(second[0]);
            for (let i = second.length - 1; i > 0; i--) {
                second[0].after(second[i]);
            }
        }
        else {
            first.replaceWith(second);
        }
    }
};
export const If = ({ condition, then, else: elseBranch }) => {
    condition.addStateChangeEvent((show) => {
        if (show) {
            ifReplace(elseBranch, then);
        }
        else {
            ifReplace(then, elseBranch);
        }
    });
    return condition.value ? then : elseBranch;
};
export const For = ({ each, children }) => {
    const elFn = children[0];
    /*
     * all references to dom nodes of array elements
     * when array is empty, a placeholder div will
     * keep the place of where array elements should go
     * childReferences should never be empty
     */
    const childReferences = each.value.length === 0 ? [createElement("div", {})] : [];
    each.addStateChangeEvent((val) => {
        const firstItem = childReferences.shift();
        while (childReferences.length > 0) {
            const el = childReferences.pop();
            el.remove();
        }
        for (let i = val.length - 1; i >= 0; i--) {
            const el = elFn(val[i], i);
            childReferences.push(el);
            if (i === 0) {
                firstItem.replaceWith(el);
            }
            else {
                firstItem.after(el);
            }
        }
        if (val.length === 0) {
            const placeholder = createElement("div", {});
            firstItem.replaceWith(placeholder);
            childReferences.push(placeholder);
        }
    });
    const initialChildren = each.value.map((item, index) => {
        const ref = elFn(item, index);
        childReferences.push(ref);
        return ref;
    });
    return Fragment({
        children: initialChildren.length > 0 ? initialChildren : childReferences[0],
    });
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
            if (name === "ref") {
                value.distributeNewState(element);
            }
            else if (value instanceof Reactive) {
                element.setAttribute(name, value.value);
                const effect = (newVal) => {
                    element.setAttribute(name, newVal);
                };
                value.addStateChangeEvent(effect);
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
