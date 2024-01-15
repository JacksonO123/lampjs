import { isSvgTag, applyChildren, setElementStyle, applyChild } from './util.js';
let mountEvents = [];
export const mount = (root, el) => {
    if (!root || !el)
        return;
    if (Array.isArray(el)) {
        applyChildren(root, el);
    }
    else {
        applyChild(root, el);
    }
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
export const getStateValue = (val) => {
    if (isState(val))
        return val.value;
    return val;
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
const compChildIsEl = (element) => {
    return element instanceof HTMLElement || element instanceof SVGElement || element instanceof Text;
};
export const reactiveElement = (fn, states) => {
    const values = states.map((s) => s.value);
    let res = fn(...values);
    if ((Array.isArray(res) && !res.reduce((acc, curr) => acc && compChildIsEl(curr), true)) ||
        (!Array.isArray(res) && !compChildIsEl(res))) {
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
export const Fragment = ({ children }) => {
    return children;
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
const getRegExpForSlugs = (url) => {
    const slugs = [];
    let parts = url.split('[').filter((item) => item.length !== 0);
    return [
        slugs,
        parts
            .map((part) => {
            const tempParts = part.split(']');
            if (tempParts.length === 1)
                return part;
            slugs.push(tempParts[0]);
            tempParts[0] = '(.*)';
            return tempParts.join('');
        })
            .join('')
    ];
};
const getUrlInfo = (path) => {
    const tempPath = path.slice(1);
    const url = tempPath.split('?')[0];
    const [slugs, reg] = getRegExpForSlugs(url);
    return [slugs, new RegExp('/' + reg)];
};
const getSearchParams = (str) => {
    if (!str)
        return {};
    return str.split('&').reduce((acc, curr) => {
        const [key, value] = curr.split('=');
        try {
            acc[key] = JSON.parse(value);
        }
        catch (_) {
            acc[key] = value;
        }
        return acc;
    }, {});
};
export const getRouteElement = (fullPath, pathAcc, data) => {
    const [path, paramString] = fullPath.split('?');
    const dataPath = trimPath(data.path);
    const currentPath = pathAcc + (pathAcc === '/' ? '' : '/') + dataPath;
    const [slugs, urlReg] = getUrlInfo(currentPath);
    const params = getSearchParams(paramString);
    const matches = path.match(urlReg);
    if (matches) {
        const pathMatches = Array.from(matches).slice(1);
        if (pathMatches.length > 0) {
            const slugMap = {};
            for (let i = 0; i < pathMatches.length; i++) {
                slugMap[slugs[i]] = pathMatches[i];
            }
            return data.element(slugMap, params);
        }
    }
    if (path === currentPath)
        return data.element({}, {});
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
export class RouteData {
    path;
    element;
    nested;
    constructor(path, element, nested) {
        this.path = path;
        this.element = element;
        this.nested = nested;
    }
}
export const Router = (props) => {
    const { children, onRouteChange } = props;
    const pathname = location.pathname;
    currentPathname(pathname);
    window.addEventListener('popstate', (e) => {
        const newPath = e.currentTarget.location.pathname;
        currentPathname(newPath);
    });
    const handleNewRoute = (path) => {
        const search = location.search;
        const fullPath = path + search;
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                const el = getRouteElement(fullPath, '/', children[i]);
                if (validChild(el))
                    return el;
            }
            return page404();
        }
        const el = getRouteElement(fullPath, '/', children);
        if (validChild(el))
            return el;
        return page404();
    };
    if (onRouteChange) {
        createEffect(() => {
            const currentElement = handleNewRoute(currentPathname().value);
            onRouteChange(currentElement);
        }, [currentPathname()]);
        return handleNewRoute(currentPathname().value);
    }
    return reactiveElement(handleNewRoute, [currentPathname()]);
};
export const Route = (props) => {
    const { path, content, children } = props;
    return new RouteData(path, content, children ? (Array.isArray(children) ? children : [children]) : []);
};
export const redirect = (to) => {
    currentPathname(to);
    window.history.pushState({}, '', to);
};
export const Link = ({ children, href }) => {
    const handleClick = (e) => {
        e.preventDefault();
        const hrefVal = isState(href) ? href.value : href;
        redirect(hrefVal);
    };
    return createElement('a', { onClick: handleClick, href: getStateValue(href) }, children);
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
        if (elementIsNode(elseBranch, then)) {
            if (show) {
                elementReplace(elseBranch, then);
            }
            else {
                elementReplace(then, elseBranch);
            }
        }
    });
    return condition.value ? then : elseBranch;
};
export const For = ({ each, children }) => {
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
        const cleanup = (...args) => {
            collectCleanupSignals(i, ...args);
        };
        const item = each.value[i];
        const indexState = createState(i);
        const itemState = createState(item);
        const res = children(itemState, indexState, cleanup);
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
                el[2]().terminate();
                const terminators = toTerminate[info.length - 1];
                if (terminators) {
                    terminators.forEach((terminator) => terminator.terminate());
                    toTerminate[info.length - 1] = [];
                }
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
                const el = valueToElement(children(newValState, newIndexState, (...args) => collectCleanupSignals(i, ...args)));
                info[i][0].replaceWith(el);
                info[i] = [el, newValState, newIndexState];
                continue;
            }
            const newIndexState = createState(i);
            const newValState = createState(val[i]);
            const el = valueToElement(children(newValState, newIndexState, (...args) => collectCleanupSignals(i, ...args)));
            info[i - 1][0].after(el);
            info.push([el, newValState, newIndexState]);
        }
        while (info.length > val.length) {
            const index = info.length - 1;
            const elInfo = info.pop();
            elInfo[0].remove();
            elInfo[1]().terminate();
            elInfo[2]().terminate();
            const terminators = toTerminate[index];
            if (terminators) {
                terminators.forEach((terminator) => terminator.terminate());
                toTerminate[index] = [];
            }
        }
    });
    return info.map((item) => item[0]);
};
export class CaseData {
    value;
    children;
    isDefault;
    constructor(value, children, isDefault) {
        this.value = value;
        this.children = children;
        this.isDefault = Boolean(isDefault);
    }
}
export const getSwitchElement = (data, val) => {
    if (Array.isArray(data)) {
        let defaultIndex = -1;
        for (let i = 0; i < data.length; i++) {
            if (data[i].isDefault)
                defaultIndex = i;
            if (data[i].value === val) {
                return data[i].children;
            }
        }
        if (defaultIndex >= 0) {
            return data[defaultIndex].children;
        }
        else {
            throw new Error('Switch case not met, expected Default element');
        }
    }
    else {
        if (data.isDefault) {
            return data.children;
        }
        else {
            throw new Error('Expected default element for single child Switch element');
        }
    }
};
export const Switch = (props) => {
    const { condition, children } = props;
    const effect = (val) => {
        return getSwitchElement(children, val);
    };
    return reactiveElement((val) => effect(val), [condition]);
};
export const Case = ({ value, children, isDefault = false }) => {
    return new CaseData(value, children, isDefault);
};
export const elementIsNode = (...el) => {
    return el.reduce((acc, curr) => acc && (curr instanceof HTMLElement || curr instanceof SVGElement || curr instanceof Text), true);
};
export const wait = (el) => {
    const placeholder = document.createElement('div');
    (async () => {
        const res = await el;
        if (elementIsNode(res)) {
            placeholder.replaceWith(res);
        }
    })();
    return placeholder;
};
export const Suspense = ({ children, render, fallback, decoder, suspenseId }) => {
    let elToReplace = fallback;
    children
        .then((current) => {
        if (decoder)
            return decoder(current);
        if (current instanceof Response)
            return current.json();
        return Promise.resolve(current);
    })
        .then(async (val) => {
        const el = render
            ? render(val)
            : !(val instanceof Node)
                ? document.createTextNode(val + '')
                : val;
        elementReplace(elToReplace, el);
    });
    if (suspenseId) {
        const ssrCache = document.getElementById('_LAMPJS_DATA_');
        if (ssrCache) {
            const data = JSON.parse(ssrCache.innerHTML);
            if (data[suspenseId]) {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = data[suspenseId];
                const cachedEl = Array.from(wrapper.childNodes);
                elToReplace = cachedEl;
            }
        }
    }
    return elToReplace;
};
export const createElement = (tag, attrs, ...children) => {
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
                element.setAttribute(name, value.value + '');
                // @ts-ignore
                element[name] = value.value + '';
                const effect = (newVal) => {
                    // @ts-ignore
                    element[name] = newVal + '';
                    element.setAttribute(name, newVal + '');
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
