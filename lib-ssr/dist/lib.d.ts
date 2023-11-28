import { ComponentFactory, ComponentAttributes, ComponentChild, SuspenseFn, ResponseData, ValueFromResponse, FetchResponse } from '@jacksonotto/lampjs/types';
import { CacheType, DOMStructure, HtmlOptions } from './types.js';
export declare const createElementSSR: (tag: string | ComponentFactory, attrs: ComponentAttributes | null, ...children: ComponentChild[]) => DOMStructure;
export declare const toHtmlString: (structure: DOMStructure | string, options: HtmlOptions, cache: CacheType) => Promise<string>;
export declare const mountSSR: (target: HTMLElement, newDom: JSX.Element) => Promise<void>;
type SuspenseProps<T extends FetchResponse<any> | Promise<any>, K extends boolean> = {
    children: T | JSX.Element;
    fallback: JSX.Element;
    render?: SuspenseFn<T>;
    decoder?: (value: ResponseData<ValueFromResponse<T>>) => any;
    waitServer?: K;
} & (K extends true ? {
    suspenseId: string;
} : {
    suspenseId?: string;
});
export declare function ServerSuspense<T extends FetchResponse<any> | Promise<any>, K extends boolean>({ children, fallback, decoder, render, waitServer, suspenseId }: SuspenseProps<T, K>, options: HtmlOptions, cache: CacheType): any;
type ServerRouterPropsJSX = {
    children: JSX.Element | JSX.Element[];
};
export declare function ServerRouter(props: ServerRouterPropsJSX, options: HtmlOptions, cache: CacheType): any;
export {};
