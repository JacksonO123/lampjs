import { isSvgTag, setElementStyle, applyChildren } from 'start-dom-jsx/dist/utils';
export const mount = (root, el) => {
    if (!root)
        return;
    root.appendChild(el);
};
const getStateEl = (val, builder) => {
    if (builder) {
        return builder(val);
    }
    else {
        const node = document.createElement('span');
        node.innerHTML = val + '';
        return node;
    }
};
export const createState = (value, builder) => {
    let currentValue = value;
    let builderCb = builder;
    let node;
    let deps = [];
    node = getStateEl(currentValue, builderCb);
    const applyDep = (dep) => {
        deps.push(dep);
    };
    return (newValue) => {
        if (newValue !== undefined) {
            if (typeof newValue === 'function') {
                const updateCb = newValue;
                currentValue = updateCb(currentValue);
            }
            else {
                currentValue = newValue;
            }
            const newNode = getStateEl(currentValue, builderCb);
            node.replaceWith(newNode);
            node = newNode;
            deps.forEach((dep) => {
                dep();
            });
        }
        return {
            el: node,
            value: currentValue,
            applyDep
        };
    };
};
export const createEffect = (cb, deps) => {
    deps.forEach((dep) => {
        dep().applyDep(cb);
    });
};
export const createAsyncCall = {
    get: (url, requestInit) => {
        const data = {
            loading: true,
            data: null
        };
        return (cb, parser) => {
            cb(data);
            fetch(url, requestInit)
                .then((res) => {
                if (parser === null)
                    return res;
                else if (parser)
                    return parser(res);
                return res.json();
            })
                .then((resData) => {
                data.loading = false;
                data.data = resData;
                cb(data);
            });
        };
    }
};
export const Fragment = ({ children }) => {
    console.log(children);
    return children;
};
const xlinkNS = 'http://www.w3.org/1999/xlink';
export const createElement = (tag, attrs, ...children) => {
    console.log(tag);
    if (typeof tag === 'function')
        return tag(Object.assign(Object.assign({}, attrs), { children }));
    const isSvg = isSvgTag(tag);
    const element = isSvg
        ? document.createElementNS('http://www.w3.org/2000/svg', tag)
        : document.createElement(tag);
    if (attrs) {
        if (attrs.style &&
            typeof attrs.style !== 'string' &&
            typeof attrs.style !== 'number' &&
            typeof attrs.style !== 'boolean') {
            setElementStyle(element, attrs.style);
            delete attrs.style;
        }
        for (let name of Object.keys(attrs)) {
            const value = attrs[name];
            if (tag === 'input' && name === 'value') {
                const state = value;
                const update = () => {
                    element.value = state().value;
                };
                state().applyDep(update);
            }
            else if (name.startsWith('on')) {
                if (name === 'onChange') {
                    name = 'onInput';
                }
                const finalName = name.replace(/Capture$/, '');
                const useCapture = name !== finalName;
                const eventName = finalName.toLowerCase().substring(2);
                if (value && typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean')
                    element.addEventListener(eventName, value, useCapture);
            }
            else if (isSvg && name.startsWith('xlink:')) {
                if (value && typeof value !== 'number' && typeof value !== 'boolean') {
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
