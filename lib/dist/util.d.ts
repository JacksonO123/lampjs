import { ComponentChild } from "./types";
export declare const isSvgTag: (tag: string) => boolean;
export declare const setElementStyle: (element: JSX.Element, style: Partial<CSSStyleDeclaration>) => void;
export declare const applyChild: (element: JSX.Element, child: ComponentChild) => void;
export declare const applyChildren: (element: JSX.Element, children: ComponentChild[]) => void;
