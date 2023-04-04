import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from './types';
export declare const mount: (root: HTMLElement | null, el: JSX.Element) => void;
type Builder<T> = (value: T) => [JSX.Element, ReturnType<typeof createState<any>>[]];
export type stateObj<T> = {
    el: () => JSX.Element;
    applyDep: (dep: () => void) => void;
    getStateId: () => string;
    value: T;
};
export declare const onPageMount: (cb: () => void) => void;
export declare const createState: <T>(value: T, builder?: Builder<T> | undefined) => (newValue?: T | ((val: T) => T) | undefined) => stateObj<T>;
export declare const createEffect: <T extends (val?: any) => stateObj<any>>(cb: () => void, deps: T[]) => void;
export type asyncCallState<T> = {
    loading: boolean;
    data: T | null;
};
export declare const createAsyncCall: <T>(url: string, requestInit?: RequestInit) => (cb: (val: asyncCallState<T>) => void, parser?: ((...args: any[]) => any) | null | undefined) => void;
export declare const Fragment: ({ children }: {
    children: JSX.Element;
}) => JSX.Element;
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes, ...children: ComponentChild[]) => JSX.Element;
export {};
