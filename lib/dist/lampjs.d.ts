import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from "./types";
export declare const mount: (root: HTMLElement | null, el: JSX.Element | JSX.Element[]) => void;
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
export type Reactive<T> = ReturnType<typeof createState<T>>;
export declare const createEffect: <T extends StateData<any>>(cb: () => void, deps: T[]) => void;
export type asyncCallState<T> = {
    loading: boolean;
    data: T | null;
};
type InnerStateFromArray<T extends readonly StateData<any>[]> = {
    [K in keyof T]: T[K] extends StateData<infer U> ? U : never;
};
export declare const reactive: <T extends readonly StateData<any>[]>(fn: (...val: InnerStateFromArray<T>) => JSX.Element | null, states: T) => JSX.Element | null;
export declare const Fragment: ({ children }: {
    children: ComponentChild;
}) => ComponentChild;
type RoutesType = {
    path: string;
    element: JSX.Element;
}[];
type RouterProps = {
    routes: RoutesType;
};
export declare const Router: ({ routes }: RouterProps) => JSX.Element | null;
type LinkProps = {
    children: ComponentChild;
    href: string;
};
export declare const Link: ({ children, href }: LinkProps) => JSX.Element;
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes, ...children: ComponentChild[]) => JSX.Element;
export {};
