import type { JSX, ComponentChild, ComponentAttributes, ComponentFactory, RouterPropsJSX, ForPropsJSX, SwitchPropsJSX, SuspenseProps, IfPropsJSX, LinkProps, RouteContent } from './types.js';
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
export declare const getStateValue: <T>(val: T | Reactive<T>) => T;
type InnerStateFromArray<T extends readonly Reactive<any>[]> = {
    [K in keyof T]: T[K] extends Reactive<infer U> ? U : Exclude<T[K], Reactive<any>>;
};
export declare const reactive: <T extends readonly any[], K>(fn: (...val: InnerStateFromArray<T>) => K, states: T) => (newState?: K | ((val: K) => K) | undefined) => Reactive<K>;
export declare const reactiveElement: <T extends readonly Reactive<any>[]>(fn: (...val: InnerStateFromArray<T>) => ComponentChild, states: T) => JSX.SyncElement | null;
export declare const Fragment: ({ children }: {
    children: ComponentChild;
}) => ComponentChild;
export declare const getRouteElement: <T = JSX.Element>(fullPath: string, pathAcc: string, data: RouteData<T>) => T | T[] | null;
export declare class RouteData<T = JSX.Element> {
    readonly path: string;
    readonly element: RouteContent<T>;
    readonly nested: RouteData<T>[];
    constructor(path: string, element: RouteContent<T>, nested: RouteData<T>[]);
}
export declare const Router: (props: RouterPropsJSX) => HTMLElement | SVGElement | Text | RouteData<any> | CaseData<any> | Promise<JSX.SyncElement> | null;
type RoutePropsJSX = {
    path: string;
    content: RouteContent<JSX.Element>;
    children?: JSX.Element | JSX.Element[];
};
export declare const Route: (props: RoutePropsJSX) => RouteData<JSX.Element>;
export declare const redirect: (to: string) => void;
export declare const Link: ({ children, href }: LinkProps) => JSX.Element;
export declare const If: ({ condition, then, else: elseBranch }: IfPropsJSX) => JSX.Element;
export declare const For: <T>({ each, children }: ForPropsJSX<T>) => JSX.Element;
export declare class CaseData<T> {
    readonly value: T | undefined;
    readonly children: JSX.Element;
    readonly isDefault: boolean;
    constructor(value: T | undefined, children: JSX.Element, isDefault: boolean);
}
export declare const getSwitchElement: <T>(data: CaseData<T> | CaseData<T>[], val: T) => JSX.Element;
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
