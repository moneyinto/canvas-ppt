
/// <reference types="vite/client" />

declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare interface Window {
    MathJax: any;
}

type Electron = {
    exit: () => void;
    readFile: (path: string) => string;
    saveFile: (path: string, content: string) => boolean;
};

interface Window {
    electron: Electron;
}
