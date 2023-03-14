import { mount, createState, createElement, createEffect } from './liquidjs';
declare const exportObj: {
    createElement: (tag: string | import("start-dom-jsx").ComponentFactory, attrs: import("start-dom-jsx").ComponentAttributes, ...children: import("start-dom-jsx").ComponentChild[]) => JSX.Element;
    mount: (root: HTMLElement | null, el: JSX.Element) => void;
    createState: <T>(value: T, builder?: ((val: T) => JSX.Element) | undefined) => (newValue?: T | ((val: T) => T) | undefined) => {
        el: JSX.Element;
        applyDep: (dep: () => void) => void;
        value: T;
    };
    createEffect: (cb: () => void, deps: ((val?: any) => {
        el: JSX.Element;
        applyDep: (dep: () => void) => void;
        value: any;
    })[]) => void;
};
declare global {
    let LiquidJs: typeof exportObj;
}
export { createElement, mount, createState, createEffect };
export default exportObj;
