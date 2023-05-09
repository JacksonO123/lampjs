export declare const exportObj: {
    createElement: (tag: string | import("./types").ComponentFactory, attrs: import("./types").ComponentAttributes, ...children: import("./types").ComponentChild[]) => JSX.Element;
    mount: (root: HTMLElement | null, el: JSX.Element) => void;
    createState: <T>(value: T) => (newState?: T | ((val: T) => T) | undefined) => import("./lampjs").StateData<T> | undefined;
    createEffect: <T_1 extends (newState?: any) => import("./lampjs").StateData<any> | undefined>(cb: () => void, deps: T_1[]) => void;
    Fragment: ({ children }: {
        children: JSX.Element;
    }) => JSX.Element;
    onPageMount: (cb: () => void) => void;
};
declare global {
    let LampJs: typeof exportObj;
}
export default exportObj;
export * from './lampjs';
export type { ChangeEvent } from './types';
