import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from './types';
export declare const mount: (root: HTMLElement | null, el: JSX.Element) => void;
type stateObj<T> = {
    el: JSX.Element;
    applyDep: (dep: () => void) => void;
    value: T;
};
export declare const createState: <T>(value: T, builder?: ((val: T) => JSX.Element) | undefined) => (newValue?: T | ((val: T) => T) | undefined) => stateObj<T>;
export declare const createEffect: <T extends (val?: any) => stateObj<any>>(cb: () => void, deps: T[]) => void;
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes, ...children: ComponentChild[]) => JSX.Element;
export {};
