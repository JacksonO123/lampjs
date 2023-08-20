import { Reactive } from "./lampjs";
export declare const exportObj: {
    createElement: (tag: string | import("./types").ComponentFactory, attrs: import("./types").ComponentAttributes, ...children: import("./types").ComponentChild[]) => JSX.Element;
    mount: (root: HTMLElement | null, el: JSX.Element | JSX.Element[]) => void;
    createState: <T>(value: T) => (newState?: T | ((val: T) => T) | undefined) => Reactive<T>;
    createEffect: <T_1 extends Reactive<any>>(cb: () => void, deps: T_1[]) => void;
    Fragment: ({ children }: {
        children: import("./types").ComponentChild;
    }) => import("./types").ComponentChild;
    onPageMount: (cb: () => void) => void;
    reactive: <T_2 extends readonly Reactive<any>[]>(fn: (...val: { [K in keyof T_2]: T_2[K] extends Reactive<infer U> ? U : never; }) => JSX.Element | null, states: T_2) => JSX.Element | null;
    Router: ({ routes }: {
        routes: {
            path: string;
            element: JSX.Element;
        }[];
    }) => JSX.Element | null;
    Link: ({ children, href }: {
        children: import("./types").ComponentChild;
        href: string;
    }) => JSX.Element;
    For: <T_3>({ each, children }: {
        each: Reactive<T_3[]>;
        children: (item: T_3, index: number) => JSX.Element;
    }) => JSX.Element;
    Reactive: typeof Reactive;
};
declare global {
    let LampJs: typeof exportObj;
}
export default exportObj;
export * from "./lampjs";
export type { ChangeEvent } from "./types";
