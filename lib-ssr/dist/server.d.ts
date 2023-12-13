/// <reference types="express-serve-static-core" resolution-mode="require"/>
export default function startServer(cliProd?: boolean, cliPort?: number, getApp?: (app: Express.Application) => void): Promise<void>;
