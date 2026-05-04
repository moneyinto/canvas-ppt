import { defineConfig, Plugin, UserConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import * as path from "path";

export default defineConfig(({ mode }) => {
    const name = "mpptx在线文档";
    const port: number = parseInt(process.env.APP_PORT || "8000");

    const plugins: (Plugin | Plugin[])[] = [
        vue(),
        createSvgIconsPlugin({
            iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
            symbolId: "icon-[name]"
        }),
        splitVendorChunkPlugin(),
        eslintPlugin({
            include: ["src/**/*.ts", "src/**/*.vue", "src/*.vue"]
        })
    ];

    const version = require("./package.json").version;

    const defaultOptions: UserConfig = {
        define: {
            __APP_MPPTX__: {
                name,
                version
            }
        },
        base: "./",
        plugins,
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src")
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    // Vite 3 仍通过 Sass legacy JS API 编译样式，这里先静默对应弃用警告。
                    silenceDeprecations: ["legacy-js-api"]
                },
                sass: {
                    // 兼容缩进语法文件的同类配置。
                    silenceDeprecations: ["legacy-js-api"]
                }
            }
        },
        server: {
            host: true,
            port
        },
        build: {
            outDir: "dist",
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes("node_modules/")) {
                            return id
                                .toString()
                                .split("node_modules/")[1]
                                .split("/")[0]
                                .toString();
                        }
                    },
                    chunkFileNames: "assets/js/[name]-[hash].js",
                    entryFileNames: "assets/js/[name]-[hash].js",
                    assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
                }
            },
            minify: mode === "production" ? "terser" : false
        }
    };

    return {
        ...defaultOptions
    };
});
