import colors = require("./colors");
export let content: any[];
export namespace theme {
    namespace extend {
        export namespace spacing {
            let full: string;
        }
        export namespace borderRadius {
            let xs: string;
        }
        export { colors };
    }
}
export let plugins: ({
    handler: import("tailwindcss/types/config").PluginCreator;
    config?: Partial<import("tailwindcss/types/config").Config>;
} | {
    handler: () => void;
})[];
//# sourceMappingURL=index.d.ts.map