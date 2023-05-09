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
    readFile: (path: string) => File;
    saveFile: (path: string, buffer: Buffer) => boolean;
};

interface Window {
    electron: Electron;
}
