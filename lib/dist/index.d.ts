export declare const exportObj: {
    createElement: (tag: string | import("./types").ComponentFactory, attrs: import("./types").ComponentAttributes, ...children: import("./types").ComponentChild[]) => JSX.Element;
    mount: (root: HTMLElement | null, el: JSX.Element) => void;
    createState: <T>(value: T) => (newState?: T | ((val: T) => T) | undefined) => import("./lampjs").StateData<T>;
    createEffect: <T_1 extends import("./lampjs").StateData<any>>(cb: () => void, deps: T_1[]) => void;
    Fragment: ({ children }: {
        children: JSX.Element;
    }) => JSX.Element;
    onPageMount: (cb: () => void) => void;
    reactive: <T_2 extends readonly import("./lampjs").StateData<any>[]>(fn: (...val: { [K in keyof T_2]: T_2[K] extends import("./lampjs").StateData<infer U> ? U : never; }) => JSX.Element, states: T_2) => JSX.Element;
};
declare global {
    let LampJs: typeof exportObj;
}
export default exportObj;
export * from "./lampjs";
export type { ChangeEvent } from "./types";
