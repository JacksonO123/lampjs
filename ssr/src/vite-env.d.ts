/// <reference types="vite/client" />

import { createElement, Fragment, FetchResponse } from '@jacksonotto/lampjs';

declare global {
  let createElement: typeof createElement;
  let Fragment: typeof Fragment;
  function fetch<T>(url: string, options?: RequestInit): FetchResponse<T>;
}
