import { mount, createState, createElement, createEffect } from './liquidjs';

const exportObj = { createElement, mount, createState, createEffect };

declare global {
  let LiquidJs: typeof exportObj;
}

export { createElement, mount, createState, createEffect };

export default exportObj;
