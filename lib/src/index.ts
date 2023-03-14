import { h as createElement } from 'start-dom-jsx';
import { mount, createState } from './liquidjs';

const exportObj = { createElement, mount, createState };

declare global {
  let LiquidJs: typeof exportObj;
}

export { createElement, mount, createState };

export default exportObj;
