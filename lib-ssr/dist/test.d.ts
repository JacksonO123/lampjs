export declare function test(): {
    name: string;
    resolveId(source: any): any;
    load(id: string): "export default \"This is virtual!\"" | null;
};
