import { mount, createState, createElement, createEffect } from './lampjs';
declare const exportObj: {
    createElement: (tag: string | import("./types").ComponentFactory, attrs: import("./types").ComponentAttributes, ...children: import("./types").ComponentChild[]) => JSX.Element;
    mount: (root: HTMLElement | null, el: JSX.Element) => void;
    createState: <T>(value: T, builder?: ((val: T) => JSX.Element) | undefined) => (newValue?: T | ((val: T) => T) | undefined) => {
        el: JSX.Element;
        applyDep: (dep: () => void) => void;
        value: T;
    };
    createEffect: <T_1 extends (val?: any) => {
        el: JSX.Element;
        applyDep: (dep: () => void) => void;
        value: any;
    }>(cb: () => void, deps: T_1[]) => void;
};
declare global {
    let LampJs: typeof exportObj;
}
export { createElement, mount, createState, createEffect };
export default exportObj;
