
/// <reference types="vite/client" />

declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare interface Window {
    MathJax: any;
    __MPPTX__: {
        name: string;
        version: string;
    }
}
