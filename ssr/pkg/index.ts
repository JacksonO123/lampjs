import { ComponentFactory, ComponentAttributes, ComponentChild } from '@jacksonotto/lampjs/dist/types';

export type DOMStructure = {
  readonly tag: string | ComponentFactory;
  readonly attrs: ComponentAttributes;
  readonly children: ComponentChild[];
};

export const createElementSSR = (
  tag: string | ComponentFactory,
  attrs: ComponentAttributes,
  ...children: ComponentChild[]
): DOMStructure =>
  ({
    tag,
    attrs,
    children
  }) as const;

const attrsToString = (attrs: ComponentAttributes) => {
  if (attrs === null) return [];

  return Object.entries(attrs).reduce((acc, [key, value]) => {
    if (value instanceof Function || value === null || value === undefined) return acc;

    const newVal = value.toString().replace(/\\"/g, '"').replace(/"/gm, '\\"');
    acc.push(`${key}="${newVal}"`);
    return acc;
  }, [] as string[]);
};

export const toHtmlString = (structure: DOMStructure | string): string => {
  if (typeof structure === 'string') {
    return structure;
  }

  if (structure.tag instanceof Function) {
    const res = structure.tag(structure.attrs) as unknown as DOMStructure;
    return toHtmlString(res);
  }

  let childrenHtml = '';
  if (structure.children !== undefined) {
    structure.children.forEach((child) => {
      childrenHtml += toHtmlString(child as unknown as DOMStructure);
    });
  }

  const attrString = attrsToString(structure.attrs);

  return `<${structure.tag}${attrString.length > 0 ? ' ' : ''}${attrString.join(' ')}>${childrenHtml}</${
    structure.tag
  }>`;
};
