import { defineConfig, Plugin, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint";
import * as path from "path";

export default defineConfig(({ mode }) => {
    const name = "canvas-ppt";
    const port: number = parseInt(process.env.APP_PORT || "8000");

    const plugins: (Plugin | Plugin[])[] = [
        vue(),
        eslintPlugin({
            include: ["src/**/*.ts", "src/**/*.vue", "src/*.vue"]
        })
    ];

    const defaultOptions: UserConfig = {
        base: "./",
        plugins,
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src")
            }
        },
        server: {
            host: true,
            port
        }
    };
    
    return {
        ...defaultOptions
    };
});
