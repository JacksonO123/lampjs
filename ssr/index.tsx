import { DOMStructure, createElementSSR, toHtmlString } from "./pkg";
import App from "./src/App";

// @ts-ignore
globalThis.createElement = createElementSSR;

const res = toHtmlString((<App />) as unknown as DOMStructure);
console.log(res);
