import type { ComponentFactory, ComponentAttributes, ComponentChild, ResponseData } from '@jacksonotto/lampjs/types';
import { Reactive, State, CaseData } from '@jacksonotto/lampjs';
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
type ServerForItemFnJSX<T> = (item: State<T>, index: State<number>, cleanup: (...args: Reactive<any>[]) => void) => JSX.Element;
type ServerForPropsJSX<T> = {
    each: Reactive<T[]>;
    children: ServerForItemFnJSX<T>;
};
export declare function For<T>(props: ServerForPropsJSX<T>, options: HtmlOptions, cache: CacheType): JSX.Element;
export type IfPropsJSX = {
    condition: Reactive<boolean>;
    then: JSX.Element;
    else: JSX.Element;
};
export declare function If(props: IfPropsJSX): JSX.Element;
export type SwitchPropsJSX<T> = {
    children: JSX.Element | JSX.Element[];
    condition: Reactive<T>;
};
export type SwitchProps<T> = {
    children: CaseData<T> | CaseData<T>[];
    condition: Reactive<T>;
};
export declare function Switch<T>(props: SwitchPropsJSX<T>, options: HtmlOptions, cache: CacheType): JSX.Element;
type LinkProps = Omit<JSX.HTMLAttributes, 'href'> & {
    href: string | Reactive<string>;
};
type ServerLinkProps = LinkProps & {
    revalidate?: boolean;
};
export declare function Link({ children, href, revalidate }: ServerLinkProps, options: HtmlOptions, cache: CacheType): JSX.Element;
export {};
