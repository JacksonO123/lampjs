import { isSvgTag, applyChildren, setElementStyle } from './util';
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
            const newStateVal = newState instanceof Function ? newState(currentState.value) : newState;
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
export const isState = (val) => {
    return val instanceof Function ? val() instanceof Reactive : false;
};
export const reactive = (fn, states) => {
    const values = states.map((s) => s.value);
    const res = createState(fn(...values));
    states.forEach((state, index) => {
        state.addStateChangeEvent((val) => {
            values[index] = val;
            const newValue = fn(...values);
            res(newValue);
        });
    });
    return res;
};
export const reactiveElement = (fn, states) => {
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
const currentPathname = createState('/');
export const Router = ({ routes }) => {
    const pathname = location.pathname;
    currentPathname(pathname);
    window.addEventListener('popstate', (e) => {
        const newPath = e.currentTarget.location.pathname;
        currentPathname(newPath);
    });
    return reactiveElement((path) => routes.find((item) => item.path === path)?.element || null, [currentPathname()]);
};
export const Link = ({ children, href }) => {
    const handleClick = (e) => {
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
    if (Array.isArray(then) && then.length === 0) {
        then = createElement('div', {});
    }
    if (Array.isArray(elseBranch) && elseBranch.length === 0) {
        elseBranch = createElement('div', {});
    }
    condition.addStateChangeEvent((show) => {
        if (show) {
            elementReplace(elseBranch, then);
        }
        else {
            elementReplace(then, elseBranch);
        }
    });
    return condition.value ? then : elseBranch;
};
export const For = ({ each, children }) => {
    const elFn = children[0];
    let info = [];
    function valueToElement(val) {
        if (val instanceof HTMLElement)
            return val;
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
                const el = info.pop();
                if (el)
                    el[0].remove();
            }
            info[0].replaceWith(el);
            info[0] = [el, null, null];
            return;
        }
        for (let i = 0; i < val.length; i++) {
            if (i < info.length) {
                const valState = info[i][1];
                const indexState = info[i][2];
                if (valState !== null && indexState !== null) {
                    valState(val[i]);
                    indexState(i);
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
            const elInfo = info.pop();
            elInfo[0].remove();
        }
    });
    return info.map((item) => item[0]);
};
export const createElement = (tag, attrs, ...children) => {
    if (typeof tag === 'function')
        return tag({ ...attrs, children });
    const isSvg = isSvgTag(tag);
    const element = isSvg
        ? document.createElementNS('http://www.w3.org/2000/svg', tag)
        : document.createElement(tag);
    if (attrs) {
        if (attrs.style && typeof attrs.style === 'object') {
            setElementStyle(element, attrs.style);
            delete attrs.style;
        }
        for (let [name, value] of Object.entries(attrs)) {
            if (name === 'ref') {
                value.distributeNewState(element);
            }
            else if (value instanceof Reactive) {
                element.setAttribute(name, value.value);
                const effect = (newVal) => {
                    element.setAttribute(name, newVal);
                };
                value.addStateChangeEvent(effect);
            }
            else if (name.startsWith('on')) {
                if (name === 'onChange')
                    name = 'onInput';
                const finalName = name.replace(/Capture$/, '');
                const useCapture = name !== finalName;
                const eventName = finalName.toLowerCase().substring(2);
                if (value && typeof value === 'function') {
                    element.addEventListener(eventName, value, useCapture);
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
