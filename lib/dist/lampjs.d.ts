import type { JSX, ComponentChild, ComponentAttributes, ComponentFactory, RouterPropsJSX, ForPropsJSX, SwitchPropsJSX, SuspenseProps } from './types.js';
export declare const mount: (root: HTMLElement | null, el: JSX.Element | JSX.Element[]) => void;
export declare class Reactive<T> {
    private onStateChange;
    value: T;
    onTerminate: null | (() => void);
    constructor(value: T);
    toString(): T;
    addStateChangeEvent(event: (val: T) => void): void;
    distributeNewState(data: T): void;
    terminate(): void;
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
export declare const reactiveElement: <T extends readonly Reactive<any>[]>(fn: (...val: InnerStateFromArray<T>) => ComponentChild, states: T) => JSX.SyncElement | null;
export declare const Fragment: ({ children }: {
    children: ComponentChild;
}) => ComponentChild;
export declare const getRouteElement: <T = ComponentChild>(path: string, pathAcc: string, data: RouteData<T>) => T | T[] | null;
export declare class RouteData<T = ComponentChild> {
    readonly path: string;
    readonly element: T;
    readonly nested: RouteData<T>[];
    constructor(path: string, element: T, nested: RouteData<T>[]);
}
export declare const Router: (props: RouterPropsJSX) => JSX.SyncElement | null;
type RouteProps = {
    path: string;
    children: ComponentChild;
};
export declare const Route: ({ path, children }: RouteProps) => RouteData<string | number | boolean | Promise<any> | JSX.Element | Reactive<any> | ComponentChild[] | null | undefined>;
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
export declare const For: <T>({ each, children }: ForPropsJSX<T>) => JSX.Element;
export declare class CaseData<T> {
    readonly value: T | undefined;
    readonly children: JSX.Element;
    readonly isDefault: boolean;
    constructor(value: T | undefined, children: JSX.Element, isDefault: boolean);
}
export declare const Switch: <T>(props: SwitchPropsJSX<T>) => JSX.SyncElement | null;
type CaseProps<T> = {
    value?: T;
    children: JSX.Element;
    isDefault?: boolean;
};
export declare const Case: <T>({ value, children, isDefault }: CaseProps<T>) => CaseData<T>;
export declare const elementIsNode: (...el: ComponentChild[]) => ComponentChild;
export declare const wait: (el: JSX.Element) => HTMLDivElement;
export declare const Suspense: <T extends Promise<any>>({ children, render, fallback, decoder, suspenseId }: SuspenseProps<T>) => JSX.Element | JSX.Element[];
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes | null, ...children: ComponentChild[]) => JSX.Element;
export {};
