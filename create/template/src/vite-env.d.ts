/// <reference types="vite/client" />

import { createElement, Fragment } from "@jacksonotto/lampjs";

declare global {
  let createElement: typeof createElement;
  let Fragment: typeof Fragment;
}
