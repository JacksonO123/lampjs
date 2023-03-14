import { h as createElement } from 'start-dom-jsx';
import { mount, createState } from './liquidjs';
declare const exportObj: {
    createElement: typeof createElement;
    mount: (root: HTMLElement | null, el: JSX.Element) => void;
    createState: <T>(value: T) => (newValue?: T | ((val: T) => T) | undefined) => {
        el: HTMLSpanElement;
        value: T;
    };
};
declare global {
    let LiquidJs: typeof exportObj;
}
export { createElement, mount, createState };
export default exportObj;
