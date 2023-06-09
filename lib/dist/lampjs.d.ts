import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from "./types";
export declare const mount: (root: HTMLElement | null, el: JSX.Element) => void;
export declare class StateData<T> {
    isState: boolean;
    addEffect: (effect: () => void) => void;
    private onStateChange;
    value: T;
    constructor(value: T, addEffect: (effect: () => void) => void);
    toString(): T;
    addStateChangeEvent(event: (val: T) => void): void;
    distributeNewState(data: T): void;
}
export declare const onPageMount: (cb: () => void) => void;
export declare const createState: <T>(value: T) => (newState?: T | ((val: T) => T) | undefined) => StateData<T>;
export type StateFactory<T> = ReturnType<typeof createState<T>>;
export declare const createEffect: <T extends StateData<any>>(cb: () => void, deps: T[]) => void;
export type asyncCallState<T> = {
    loading: boolean;
    data: T | null;
};
type InnerStateFromArray<T extends readonly StateData<any>[]> = {
    [K in keyof T]: T[K] extends StateData<infer U> ? U : never;
};
export declare const reactive: <T extends readonly StateData<any>[]>(fn: (...val: InnerStateFromArray<T>) => JSX.Element, states: T) => JSX.Element;
export declare const createAsyncCall: <T>(url: string, requestInit?: RequestInit) => (cb: (val: asyncCallState<T>) => void, parser?: ((...args: any[]) => any) | null | undefined) => void;
export declare const Fragment: ({ children }: {
    children: JSX.Element;
}) => JSX.Element;
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes, ...children: ComponentChild[]) => JSX.Element;
export {};
