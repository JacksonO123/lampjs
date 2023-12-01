import type { JSX, ComponentChild, ComponentAttributes, SuspenseFn, FetchResponse, ResponseData, ValueFromResponse, ComponentFactory } from './types.js';
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
type RouterPropsJSX = {
    children: JSX.Element | JSX.Element[];
};
export declare const Router: (props: RouterPropsJSX) => JSX.SyncElement | null;
type RouteProps = {
    path: string;
    children: ComponentChild;
};
export declare const Route: ({ path, children }: RouteProps) => RouteData<string | number | boolean | JSX.Element | ComponentChild[] | Reactive<any> | Promise<any> | null | undefined>;
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
type ForItemFn<T> = (item: State<T>, index: State<number>, cleanup: (...args: Reactive<any>[]) => void) => ComponentChild;
type ForProps<T> = {
    each: Reactive<T[]>;
    children: ForItemFn<T>;
};
export declare const For: <T>({ each, children }: ForProps<T>) => JSX.Element;
export declare class CaseData<T> {
    readonly value: T | undefined;
    readonly children: JSX.Element;
    readonly isDefault: boolean;
    constructor(value: T | undefined, children: JSX.Element, isDefault: boolean);
}
type SwitchPropsJSX<T> = {
    children: JSX.Element | JSX.Element[];
    condition: Reactive<T>;
};
export declare const Switch: <T>(props: SwitchPropsJSX<T>) => JSX.SyncElement | null;
type CaseProps<T> = {
    value?: T;
    children: JSX.Element;
    isDefault?: boolean;
};
export declare const Case: <T>({ value, children, isDefault }: CaseProps<T>) => CaseData<T>;
export declare const elementIsNode: (...el: ComponentChild[]) => ComponentChild;
export declare const wait: (el: JSX.Element) => HTMLDivElement;
type SuspenseProps<T extends FetchResponse<any> | Promise<any>> = {
    children: T | Promise<any>;
    fallback: JSX.Element;
    render?: SuspenseFn<T>;
    decoder?: (value: ResponseData<ValueFromResponse<T>>) => any;
    suspenseId?: string;
};
export declare const Suspense: <T extends Promise<any> | FetchResponse<any>>({ children, render, fallback, decoder, suspenseId }: SuspenseProps<T>) => JSX.Element | JSX.Element[];
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes | null, ...children: ComponentChild[]) => JSX.Element;
export {};
