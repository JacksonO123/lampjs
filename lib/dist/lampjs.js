import { isSvgTag, applyChildren, setElementStyle } from './util';
const eventListeners = new Map();
const stateListeners = new Map();
let mountEvents = [];
const uuid = () => crypto.randomUUID();
export const mount = (root, el) => {
    if (!root || !el)
        return;
    root.appendChild(el);
    mountEvents.forEach((event) => event());
    mountEvents = [];
};
const removeStates = (states) => {
    states.forEach((state) => {
        stateListeners.delete(state().getStateId());
    });
};
const getStateEl = (val, id, builder) => {
    if (builder) {
        const [builderEl, states] = builder(val);
        removeStates(states);
        const el = builderEl;
        el.stateId = id;
        el.elId = uuid();
        return el;
    }
    else {
        const node = document.createElement('span');
        node.innerHTML = val + '';
        node.stateId = id;
        node.elId = uuid();
        return node;
    }
};
export const onPageMount = (cb) => {
    mountEvents.push(cb);
};
const replaceStateNode = (from, to, id) => {
    const stateRefs = stateListeners.get(id ? id : from.stateId);
    let index = null;
    stateRefs?.forEach((ref, i) => {
        if (ref.elId == from.elId) {
            index = i;
        }
    });
    if (index !== null) {
        if (!stateRefs) {
            stateListeners.set(from.stateId, [to]);
        }
        else {
            stateRefs[index] = to;
            stateListeners.set(from.stateId, stateRefs);
        }
    }
};
const cloneNode = (el, id) => {
    const events = eventListeners.get(id ? id : el.elId);
    const clone = el.cloneNode(false);
    clone.elId = id ? id : el.elId;
    clone.stateId = el.stateId;
    replaceStateNode(el, clone);
    if (events) {
        events.forEach((event) => {
            clone.addEventListener(event.name, event.event, event.useCapture);
        });
    }
    el.childNodes.forEach((node) => {
        const nodeClone = cloneNode(node);
        clone.appendChild(nodeClone);
    });
    return clone;
};
export const createState = (value, builder) => {
    let currentValue = value;
    let builderCb = builder;
    let refNode;
    let deps = [];
    const id = uuid();
    const handleStateChangeEvent = (e) => stateChangeEventCb(e, builderCb);
    const stateChangeEventCb = (e, _builder) => {
        const evt = e;
        const el = getStateEl(evt.value, id, builder);
        if (!el.addEventListener)
            return;
        if (evt.currentTarget) {
            el.elId = evt.currentTarget.elId;
            evt.currentTarget.removeEventListener('state-change', handleStateChangeEvent);
            replaceStateNode(evt.currentTarget, el, id);
            el.addEventListener('state-change', handleStateChangeEvent);
            evt.currentTarget.replaceWith(el);
        }
    };
    const applyDep = (dep) => {
        deps.push(dep);
    };
    const updateCb = (newValue) => {
        if (newValue !== undefined) {
            if (typeof newValue === 'function') {
                const updateCb = newValue;
                currentValue = updateCb(currentValue);
            }
            else {
                currentValue = newValue;
            }
            refNode = getStateEl(currentValue, id, builderCb);
            console.log(stateListeners);
            const eventsToDispatch = stateListeners.get(id);
            if (eventsToDispatch !== undefined) {
                eventsToDispatch.forEach((node) => {
                    const event = new Event('state-change');
                    event.value = currentValue;
                    node.dispatchEvent(event);
                });
            }
            deps.forEach((dep) => {
                dep();
            });
        }
        else if (!refNode) {
            refNode = getStateEl(currentValue, id, builderCb);
        }
        const addToStateNodes = (node) => {
            const nodes = [node];
            const elements = stateListeners.get(id);
            if (elements === undefined) {
                console.log([...stateListeners.keys()], id);
                stateListeners.set(id, nodes);
            }
            else {
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
            const clone = cloneNode(refNode, elId);
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
        };
    };
    updateCb(value);
    return updateCb;
};
export const createEffect = (cb, deps) => {
    deps.forEach((dep) => {
        dep().applyDep(cb);
    });
};
export const createAsyncCall = (url, requestInit) => {
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
        })
            .catch((err) => {
            console.error(err);
            data.loading = false;
            data.data = null;
            cb(data);
        });
    };
};
export const Fragment = ({ children }) => {
    return children;
};
const xlinkNS = 'http://www.w3.org/1999/xlink';
export const createElement = (tag, attrs, ...children) => {
    if (typeof tag === 'function')
        return tag(Object.assign(Object.assign({}, attrs), { children }));
    const isSvg = isSvgTag(tag);
    const element = (isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag));
    element.elId = uuid();
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
            if (['textarea', 'input'].includes(tag) && name === 'value') {
                const state = value;
                const update = () => {
                    element.value = state().value;
                };
                state().applyDep(update);
                update();
            }
            else if (['input', 'button', 'optgroup', 'option', 'select', 'textarea'].includes(tag) &&
                name === 'disabled') {
                if (typeof value === 'boolean') {
                    element.disabled = value;
                }
                else {
                    const state = value;
                    const update = () => {
                        element.disabled = state().value;
                    };
                    state().applyDep(update);
                    update();
                }
            }
            else if (name.startsWith('on')) {
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
                            { event: value, name: eventName, useCapture }
                        ]);
                    }
                    else {
                        eventListeners.set(element.elId, [
                            ...listeners,
                            { event: value, name: eventName, useCapture }
                        ]);
                    }
                    element.addEventListener(eventName, value, useCapture);
                }
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
