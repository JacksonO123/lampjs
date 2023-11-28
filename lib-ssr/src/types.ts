import { ComponentAttributes, ComponentChild, ComponentFactory } from '@jacksonotto/lampjs/types';

export type DOMStructure<T = ComponentAttributes> = {
  readonly tag: string | ComponentFactory;
  readonly attrs: T | null;
  children: ComponentChild[];
};

export type HtmlOptions = {
  route: string;
  headInject: string;
};

export type BuiltinServerComp = (
  props: ComponentAttributes,
  options: HtmlOptions,
  cache: Record<string, any>
) => JSX.Element;

export type CacheType = Record<string, any>;
