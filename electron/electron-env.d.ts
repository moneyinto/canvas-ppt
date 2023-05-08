/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
    interface ProcessEnv {
        VSCODE_DEBUG?: "true";
        DIST_ELECTRON: string;
        DIST: string;
        /** /dist/ or /public/ */
        PUBLIC: string;
    }
}

type Electron = {
    exit: () => void;
    readFile: (path: string) => string;
    saveFile: (path: string, content: string) => boolean;
};

interface Window {
    electron: Electron;
}
