import { JSX } from 'start-dom-jsx';

export const render = () => {};

export const mount = (root: HTMLElement | null, el: JSX.Element) => {
  if (!root) return;
  root.appendChild(el);
};
