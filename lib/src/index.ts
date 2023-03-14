import { mount, createState, createElement, createEffect } from './lampjs';

const exportObj = { createElement, mount, createState, createEffect };

declare global {
  let LampJs: typeof exportObj;
}

export { createElement, mount, createState, createEffect };

export default exportObj;
