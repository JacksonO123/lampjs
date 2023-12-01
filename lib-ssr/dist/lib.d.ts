import type { ComponentFactory, ComponentAttributes, ComponentChild, ForPropsJSX, ResponseData } from '@jacksonotto/lampjs/types';
import { CacheType, DOMStructure, HtmlOptions } from './types.js';
import { RouterPropsJSX } from '@jacksonotto/lampjs/types';
export declare const createElementSSR: (tag: string | ComponentFactory, attrs: ComponentAttributes | null, ...children: ComponentChild[]) => DOMStructure;
export declare const toHtmlString: (structure: DOMStructure | string, options: HtmlOptions, cache: CacheType) => Promise<string>;
export declare const mountSSR: (newDom: JSX.Element) => Promise<void>;
export type DataFromPromiseResponse<T extends Promise<any> | JSX.Element> = Awaited<T> extends {
    json(): Promise<infer R>;
} ? R : Awaited<T>;
type ServerSuspenseProps<T extends Promise<any> | JSX.Element, K extends boolean> = {
    children: T | JSX.Element;
    fallback: JSX.Element;
    render?: (val: DataFromPromiseResponse<T>) => JSX.Element;
    decoder?: (value: ResponseData<Awaited<T>>) => Promise<any>;
    suspenseId?: string;
    waitServer?: K;
} & (K extends true ? {
    suspenseId: string;
} : {
    suspenseId?: string;
});
export declare function Suspense<T extends Promise<any> | JSX.Element, K extends boolean>({ children, fallback, decoder, render, waitServer, suspenseId }: ServerSuspenseProps<T, K>, options: HtmlOptions, cache: CacheType): JSX.Element;
export declare function Router(props: RouterPropsJSX, options: HtmlOptions, cache: CacheType): JSX.Element;
export declare function For<T>(props: ForPropsJSX<T>, options: HtmlOptions, cache: CacheType): JSX.Element | Promise<string[]>;
export {};
