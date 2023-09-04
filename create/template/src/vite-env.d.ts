import { createElement, Fragment } from "@jacksonotto/lampjs";

/// <reference types="vite/client" />

declare global {
  let createElementLampJs: typeof createElement;
  let FragmentLampJs: typeof Fragment;
}
