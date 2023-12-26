export declare const adapters: {
    name: string;
    test: () => boolean;
    adapter: () => Promise<void>;
}[];
export declare const runAdapter: () => Promise<void>;
