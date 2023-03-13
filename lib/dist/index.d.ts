import { h as createElement } from 'start-dom-jsx';
declare const exportObj: {
    createElement: typeof createElement;
    mount: (root: HTMLElement | null, el: JSX.Element) => void;
};
declare global {
    let LiquidJs: typeof exportObj;
}
export default exportObj;
