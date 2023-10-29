import { createElement, Fragment } from "@jacksonotto/lampjs";

/// <reference types="vite/client" />

declare global {
  let createElement: typeof createElement;
  let Fragment: typeof Fragment;
}
