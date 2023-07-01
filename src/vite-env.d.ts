
/// <reference types="vite/client" />

declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare interface Window {
    MathJax: any;
    cacheDomMap: Map<string, HTMLImageElement | HTMLVideoElement>;
    __APP_MPPTX__: {
        name: string;
        version: string;
    }
}
