import { Reactive } from "./lampjs";
export const isSvgTag = (tag) => {
    return [
        "circle",
        "clipPath",
        "defs",
        "desc",
        "ellipse",
        "feBlend",
        "feColorMatrix",
        "feComponentTransfer",
        "feComposite",
        "feConvolveMatrix",
        "feDiffuseLighting",
        "feDisplacementMap",
        "feDistantLight",
        "feFlood",
        "feFuncA",
        "feFuncB",
        "feFuncG",
        "feFuncR",
        "feGaussianBlur",
        "feImage",
        "feMerge",
        "feMergeNode",
        "feMorphology",
        "feOffset",
        "fePointLight",
        "feSpecularLighting",
        "feSpotLight",
        "feTile",
        "feTurbulence",
        "filter",
        "foreignObject",
        "g",
        "image",
        "line",
        "linearGradient",
        "marker",
        "mask",
        "metadata",
        "path",
        "pattern",
        "polygon",
        "polyline",
        "radialGradient",
        "rect",
        "stop",
        "svg",
        "switch",
        "symbol",
        "text",
        "textPath",
        "title",
        "tspan",
        "use",
        "view",
    ].includes(tag);
};
export const setElementStyle = (element, style) => {
    let key;
    const keys = Object.keys(style);
    for (key of keys) {
        // @ts-ignore
        element.style[key] = style[key];
    }
};
export const applyChild = (element, child) => {
    if (child instanceof HTMLElement) {
        element.appendChild(child);
    }
    else if (typeof child === "object") {
        // @ts-ignore
        if (child && child instanceof Reactive) {
            const node = document.createTextNode(child.value.toString());
            child.addStateChangeEvent((val) => {
                node.textContent = val.toString();
            });
            element.appendChild(node);
        }
    }
    else if (typeof child === "string" ||
        typeof child === "number" ||
        typeof child === "boolean") {
        element.appendChild(document.createTextNode(child.toString()));
    }
    else {
        console.warn("Unknown type to append: ", child);
    }
};
export const applyChildren = (element, children) => {
    for (const child of children) {
        if (!child && child !== 0)
            continue;
        if (Array.isArray(child)) {
            for (const grandChild of child) {
                if (Array.isArray(grandChild)) {
                    applyChildren(element, grandChild);
                }
                else {
                    applyChild(element, grandChild);
                }
            }
        }
        else {
            applyChild(element, child);
        }
    }
};
