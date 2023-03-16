export declare const exportObj: {
    createElement: (tag: string | import("./types").ComponentFactory, attrs: import("./types").ComponentAttributes, ...children: import("./types").ComponentChild[]) => JSX.Element;
    mount: (root: HTMLElement | null, el: JSX.Element) => void;
    createState: <T>(value: T, builder?: ((val: T) => JSX.Element) | undefined) => (newValue?: T | ((val: T) => T) | undefined) => import("./lampjs").stateObj<T>;
    createEffect: <T_1 extends (val?: any) => import("./lampjs").stateObj<any>>(cb: () => void, deps: T_1[]) => void;
    Fragment: ({ children }: {
        children: JSX.Element;
    }) => JSX.Element;
};
declare global {
    let LampJs: typeof exportObj;
}
export default exportObj;
export * from './lampjs';
export type { ChangeEvent } from './types';
