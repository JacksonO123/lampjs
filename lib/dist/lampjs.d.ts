import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from "./types";
export declare const mount: (root: HTMLElement | null, el: JSX.Element | JSX.Element[]) => void;
export declare class Reactive<T> {
    private onStateChange;
    value: T;
    constructor(value: T);
    toString(): T;
    addStateChangeEvent(event: (val: T) => void): void;
    distributeNewState(data: T): void;
}
export declare const onPageMount: (cb: () => void) => void;
export declare const createState: <T>(value: T) => (newState?: T | ((val: T) => T) | undefined) => Reactive<T>;
export type State<T> = ReturnType<typeof createState<T>>;
export declare const createEffect: <T extends Reactive<any>>(cb: () => void, deps: T[]) => void;
type InnerStateFromArray<T extends readonly Reactive<any>[]> = {
    [K in keyof T]: T[K] extends Reactive<infer U> ? U : never;
};
export declare const reactive: <T extends readonly Reactive<any>[]>(fn: (...val: InnerStateFromArray<T>) => JSX.Element | null, states: T) => JSX.Element | null;
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
type ForItemFn<T> = (item: T, index: number) => JSX.Element;
type ForProps<T> = {
    each: Reactive<T[]>;
    children: ForItemFn<T>;
};
export declare const For: <T>({ each, children }: ForProps<T>) => JSX.Element;
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes, ...children: ComponentChild[]) => JSX.Element;
export {};
