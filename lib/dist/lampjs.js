import { isSvgTag, applyChildren, setElementStyle } from "./util";
let mountEvents = [];
export const mount = (root, el) => {
    if (!root || !el)
        return;
    root.appendChild(el);
    mountEvents.forEach((event) => event());
    mountEvents = [];
};
export class StateData {
    isState = true;
    addEffect;
    onStateChange;
    value;
    constructor(value, addEffect) {
        this.value = value;
        this.onStateChange = [];
        this.addEffect = addEffect;
    }
    toString() {
        console.log("returning value", this.value);
        return this.value;
    }
    addStateChangeEvent(event) {
        this.onStateChange.push(event);
    }
    distributeNewState(data) {
        this.onStateChange.forEach((fn) => fn(data));
    }
}
export const onPageMount = (cb) => {
    mountEvents.push(cb);
};
const initState = (value, addEffect) => {
    return new StateData(value, addEffect);
};
export const createState = (value) => {
    const effects = [];
    const addEffect = (effect) => {
        effects.push(effect);
    };
    let currentState = initState(value, addEffect);
    const updateCb = (newState) => {
        if (newState === undefined) {
            return currentState;
        }
        if (newState instanceof Function) {
            const newVal = newState(currentState.value);
            currentState.value = newVal;
        }
        else {
            currentState.value = newState;
        }
        currentState.distributeNewState(currentState.value);
        effects.forEach((effect) => effect());
    };
    return updateCb;
};
export const createEffect = (cb, deps) => {
    deps.forEach((dep) => {
        const d = dep();
        if (d)
            d.addEffect(cb);
    });
};
export const createAsyncCall = (url, requestInit) => {
    const data = {
        loading: true,
        data: null,
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
            if (["textarea", "input"].includes(tag) && name === "value") {
                element.value =
                    // @ts-ignore
                    value.value;
                const effect = () => {
                    element.value =
                        // @ts-ignore
                        value.value;
                };
                // @ts-ignore
                value.addEffect(effect);
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
                // @ts-ignore
                element.disabled = value.value;
                const effect = () => {
                    element.disabled =
                        // @ts-ignore
                        value.value;
                };
                // @ts-ignore
                value.addEffect(effect);
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
