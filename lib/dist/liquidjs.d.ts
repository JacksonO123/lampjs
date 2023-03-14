export declare const mount: (root: HTMLElement | null, el: JSX.Element) => void;
export declare const createState: <T>(value: T) => (newValue?: T | ((val: T) => T) | undefined) => {
    el: HTMLSpanElement;
    value: T;
};
