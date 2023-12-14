/// <reference types="express-serve-static-core" resolution-mode="require"/>
export declare const getStyleTags: (path: string) => string;
export default function startServer(cliProd?: boolean, cliPort?: number, getApp?: (app: Express.Application) => void): Promise<void>;
