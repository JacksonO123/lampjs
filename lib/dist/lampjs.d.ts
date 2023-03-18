import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from './types';
export declare const mount: (root: HTMLElement | null, el: JSX.Element) => void;
export type stateObj<T> = {
    el: () => JSX.Element;
    applyDep: (dep: () => void) => void;
    value: T;
};
export declare const onPageMount: (cb: () => void) => void;
export declare const createState: <T>(value: T, builder?: ((val: T) => JSX.Element) | undefined) => (newValue?: T | ((val: T) => T) | undefined) => stateObj<T>;
export declare const createEffect: <T extends (val?: any) => stateObj<any>>(cb: () => void, deps: T[]) => void;
export type asyncCallState<T> = {
    loading: boolean;
    data: T | null;
};
export declare const createAsyncCall: {
    get: <T>(url: string, requestInit?: RequestInit) => (cb: (val: asyncCallState<T>) => void, parser?: ((...args: any[]) => any) | undefined) => void;
};
export declare const Fragment: ({ children }: {
    children: JSX.Element;
}) => JSX.Element;
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes, ...children: ComponentChild[]) => JSX.Element;
