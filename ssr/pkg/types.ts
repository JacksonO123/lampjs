import { ComponentAttributes, ComponentChild, ComponentFactory } from '@jacksonotto/lampjs/dist/types';

export type DOMStructure = {
  readonly tag: string | ComponentFactory;
  readonly attrs: ComponentAttributes | null;
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
