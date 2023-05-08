import { app, BrowserWindow, globalShortcut, Menu } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import ElectronLog from "electron-log";

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
let url = process.env.VITE_DEV_SERVER_URL || "dist/index.html";

async function createWindow(filePath?: string) {
    win = new BrowserWindow({
        title: "MPPTX在线文档",
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // 默认最大化
    win.maximize();

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(url);
        win.webContents.openDevTools();
    } else {
        const menu = Menu.buildFromTemplate([
            {
                label: "MPPTX在线文档",
                submenu: [
                    {
                        label: "退出",
                        accelerator: "CmdOrCtrl+Q",
                        click: () => {
                            app.quit();
                        }
                    }
                ]
            }
        ]);
        Menu.setApplicationMenu(menu);

        win.loadFile(url, { query: { path: filePath || "" } });
    }

    win.webContents.on("did-finish-load", () => {
        isOpenFile = false;
    });
    
    globalShortcut.register("esc", () => {
        win?.webContents.send("esc");
    });
}

let isOpenFile = false;

app.whenReady().then(() => {
    if (!isOpenFile) {
        ElectronLog.info("whenReady");
        createWindow();
    }
});

app.on("will-finish-launching", () => {
    app.on("open-file", (event, path) => {
        isOpenFile = true;
        event.preventDefault();
        ElectronLog.info("open-file", path);
        if (app.isReady()) {
            createWindow(path);
        } else {
            app.on("ready", () => {
                createWindow(path);
            });
        }
    });
});

app.on("window-all-closed", () => {
    win = null;
    app.quit();
});

app.on("second-instance", () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on("activate", () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});
