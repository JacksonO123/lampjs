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
    const values = states.map((s) => (s instanceof Reactive ? s.value : s));
    const res = createState(fn(...values));
    states.forEach((state, index) => {
        if (!(state instanceof Reactive))
            return;
        state.addStateChangeEvent((val) => {
            values[index] = val;
            const newValue = fn(...values);
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
const isElement = (element) => {
    return element instanceof HTMLElement || element instanceof SVGElement || element instanceof Text;
};
export const reactiveElement = (fn, states) => {
    const values = states.map((s) => s.value);
    let res = fn(...values);
    if ((Array.isArray(res) && !res.reduce((acc, curr) => acc && isElement(curr), true)) ||
        (!Array.isArray(res) && !isElement(res))) {
        res = document.createTextNode(res + '');
    }
    const onStateChange = (val, index) => {
        values[index] = val;
        const newNode = fn(...values);
        if (!res || !newNode)
            return;
        if (res instanceof Text) {
            if (newNode instanceof HTMLElement || newNode instanceof SVGElement || newNode instanceof Text) {
                res.replaceWith(newNode);
            }
            else {
                res.data = newNode + '';
            }
        }
        else {
            elementReplace(res, newNode);
            res = newNode;
        }
    };
    states.forEach((state, index) => {
        state.addStateChangeEvent((val) => onStateChange(val, index));
    });
    return res;
};
export const Fragment = ({ children }) => {
    return children;
};
class RouteData {
    path;
    element;
    nested;
    constructor(path, element, nested) {
        this.path = path;
        this.element = element;
        this.nested = nested;
    }
}
const page404 = () => {
    return createElement('span', {}, ['404 page not found']);
};
const trimPath = (path) => {
    return path.trim().replace(/^\/*/, '').replace(/\/*$/g, '');
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
                if (el !== null)
                    return el;
            }
            return data.element;
        }
        return null;
    }
    if (path.startsWith(currentPath)) {
        for (let i = 0; i < data.nested.length; i++) {
            const el = getRouteElement(path, currentPath, data.nested[i]);
            if (el !== null)
                return el;
        }
    }
    return null;
};
const currentPathname = createState('/');
export const Router = ({ children }) => {
    const pathname = location.pathname;
    currentPathname(pathname);
    window.addEventListener('popstate', (e) => {
        const newPath = e.currentTarget.location.pathname;
        currentPathname(newPath);
    });
    return reactiveElement((path) => {
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                const el = getRouteElement(path, '/', children[i]);
                if (!Array.isArray(el) && el !== null && Array.isArray(el) && el.length === 0)
                    return el;
            }
            return page404();
        }
        return document.createElement('div');
    }, [currentPathname()]);
};
export const Route = ({ path, children }) => {
    const nested = [];
    if (Array.isArray(children)) {
        children = children.filter((child) => {
            if (child instanceof RouteData) {
                nested.push(child);
                return false;
            }
            return true;
        });
    }
    else {
        if (children instanceof RouteData) {
            nested.push(children);
        }
        children = [];
    }
    return new RouteData(path, children, nested);
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
    let toTerminate = {};
    const collectCleanupSignals = (index, ...args) => {
        const terminators = toTerminate[index];
        if (terminators === undefined) {
            toTerminate[index] = [...args];
        }
        else {
            terminators.push(...args);
        }
    };
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
        const res = elFn(itemState, indexState, (...args) => collectCleanupSignals(i, ...args));
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
                const el = info.pop();
                el[0].remove();
                el[1]().terminate();
                el[1]().terminate();
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
                    if (valState().value !== val[i])
                        valState(val[i]);
                    if (indexState().value !== i)
                        indexState(i);
                    continue;
                }
                const newIndexState = createState(i);
                const newValState = createState(val[i]);
                const el = valueToElement(elFn(newValState, newIndexState, (...args) => collectCleanupSignals(i, ...args)));
                info[i][0].replaceWith(el);
                info[i] = [el, newValState, newIndexState];
                continue;
            }
            const newIndexState = createState(i);
            const newValState = createState(val[i]);
            const el = valueToElement(elFn(newValState, newIndexState, (...args) => collectCleanupSignals(i, ...args)));
            info[i - 1][0].after(el);
            info.push([el, newValState, newIndexState]);
        }
        while (info.length > val.length) {
            const index = info.length - 1;
            const elInfo = info.pop();
            elInfo[1]().terminate();
            elInfo[2]().terminate();
            elInfo[0].remove();
            toTerminate[index].forEach((terminator) => terminator.terminate());
        }
    });
    return info.map((item) => item[0]);
};
export const Switch = ({ condition, children }) => {
    const effect = (val) => {
        if (Array.isArray(children)) {
            let defaultIndex = -1;
            for (let i = 0; i < children.length; i++) {
                if (children[i].isDefault)
                    defaultIndex = i;
                if (children[i].value === val) {
                    return children[i].children;
                }
            }
            if (defaultIndex >= 0) {
                return children[defaultIndex].children;
            }
            else {
                throw new Error('Switch case not met, expected Default element');
            }
        }
        else {
            if (children.isDefault) {
                return children.children;
            }
            else {
                throw new Error('Expected default element for single child Switch element');
            }
        }
    };
    return reactiveElement((val) => effect(val), [condition]);
};
export const Case = ({ value, children, isDefault = false }) => {
    return {
        value,
        children,
        isDefault
    };
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
            if (attrs.style instanceof Reactive) {
                const reactiveObj = attrs.style;
                reactiveObj.addStateChangeEvent((newVal) => {
                    setElementStyle(element, newVal);
                });
                setElementStyle(element, attrs.style.value);
            }
            else {
                setElementStyle(element, attrs.style);
            }
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
