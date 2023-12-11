/// <reference types="vite/client" />

import { HtmlOptions, createElementSSR } from './index';

declare global {
  var createElement: typeof createElementSSR;
  var SSR: boolean | undefined;
}
