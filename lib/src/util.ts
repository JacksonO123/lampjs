import { ComponentChild } from "./types";
import { StateData } from "./lampjs";

export const isSvgTag = (tag: string) => {
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

export const setElementStyle = (
  element: JSX.Element,
  style: Partial<CSSStyleDeclaration>
) => {
  let key;
  const keys = Object.keys(style);
  for (key of keys) {
    // @ts-ignore
    element.style[key] = style[key];
  }
};

export const applyChild = (element: JSX.Element, child: ComponentChild) => {
  if (child instanceof HTMLElement) {
    element.appendChild(child);
  } else if (typeof child === "object") {
    // @ts-ignore
    if (
      child !== null &&
      typeof child === "object" &&
      (child as StateData<any>).isState
    ) {
      const node = document.createTextNode(
        (child as StateData<any>).value.toString()
      );
      (child as StateData<any>).addStateChangeEvent((val) => {
        node.textContent = val.toString();
      });
      element.appendChild(node);
    }
  } else if (
    typeof child === "string" ||
    typeof child === "number" ||
    typeof child === "boolean"
  ) {
    element.appendChild(document.createTextNode(child.toString()));
  } else {
    console.warn("Unknown type to append: ", child);
  }
};

export const applyChildren = (
  element: JSX.Element,
  children: ComponentChild[]
) => {
  for (const child of children) {
    if (!child && child !== 0) continue;
    if (Array.isArray(child)) {
      for (const grandChild of child) {
        if (Array.isArray(grandChild)) {
          applyChildren(element, grandChild);
        } else {
          applyChild(element, grandChild);
        }
      }
    } else {
      applyChild(element, child);
    }
  }
};
