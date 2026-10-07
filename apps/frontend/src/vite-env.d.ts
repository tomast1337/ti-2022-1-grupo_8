/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module "*.module.scss" {
    const classes: Record<string, string>;
    export default classes;
}
