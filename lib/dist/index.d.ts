import { createElement, Fragment } from "./lampjs";
declare global {
    let createElementLampJs: typeof createElement;
    let FragmentLampJs: typeof Fragment;
}
export * from "./lampjs";
export type { ChangeEvent } from "./types";
