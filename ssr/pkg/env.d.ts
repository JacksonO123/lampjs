import { HtmlOptions, createElementSSR } from './index';

declare global {
  var createElement: typeof createElementSSR;
}
