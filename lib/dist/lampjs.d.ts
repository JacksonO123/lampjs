import type { JSX, ComponentChild, ComponentFactory, ComponentAttributes } from './types';
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
export declare const reactiveElement: <T extends readonly Reactive<any>[]>(fn: (...val: InnerStateFromArray<T>) => ComponentChild, states: T) => JSX.Element | null;
export declare const Fragment: ({ children }: {
    children: ComponentChild;
}) => ComponentChild;
type RouterProps = {
    children: JSX.Element | JSX.Element[];
};
export declare const Router: ({ children }: RouterProps) => JSX.Element | null;
type RouteProps = {
    path: string;
    children: ComponentChild;
};
export declare const Route: ({ path, children }: RouteProps) => JSX.Element;
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
type SwitchProps<T> = {
    children: JSX.Element | JSX.Element[];
    condition: Reactive<T>;
};
export declare const Switch: <T>({ condition, children }: SwitchProps<T>) => JSX.Element | null;
type CaseProps<T> = {
    value?: T;
    children: JSX.Element;
    isDefault?: boolean;
};
export declare const Case: <T>({ value, children, isDefault }: CaseProps<T>) => JSX.Element;
export declare const createElement: (tag: string | ComponentFactory, attrs: ComponentAttributes, ...children: ComponentChild[]) => JSX.Element;
export {};
