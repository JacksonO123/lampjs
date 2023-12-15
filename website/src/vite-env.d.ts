/// <reference types="vite/client" />

import { createElement as _createElement, Fragment, FetchResponse } from '@jacksonotto/lampjs';

declare global {
  let createElement: typeof _createElement;
  let Fragment: typeof Fragment;
  function fetch<T>(url: string, options?: RequestInit): FetchResponse<T>;
}
