import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from './types';
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
export declare const isState: <T>(val: T | ((newState?: T | ((val: T) => T) | undefined) => Reactive<T>)) => boolean;
type InnerStateFromArray<T extends readonly Reactive<any>[]> = {
    [K in keyof T]: T[K] extends Reactive<infer U> ? U : Exclude<T[K], Reactive<any>>;
};
export declare const reactive: <T extends readonly any[], K>(fn: (...val: InnerStateFromArray<T>) => K, states: T) => (newState?: K | ((val: K) => K) | undefined) => Reactive<K>;
export declare const reactiveElement: <T extends readonly Reactive<any>[]>(fn: (...val: InnerStateFromArray<T>) => ComponentChild, states: T) => JSX.Element | null;
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
type IfProps = {
    condition: Reactive<boolean>;
    then: JSX.Element;
    else: JSX.Element;
};
export declare const If: ({ condition, then, else: elseBranch }: IfProps) => JSX.Element;
type ForItemFn<T> = (item: State<T>, index: State<number>) => ComponentChild;
type ForProps<T> = {
    each: Reactive<T[]>;
    children: ForItemFn<T>;
};
export declare const For: <T>({ each, children }: ForProps<T>) => JSX.Element;
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes, ...children: ComponentChild[]) => JSX.Element;
export {};
