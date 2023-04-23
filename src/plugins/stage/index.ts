import StageConfig from "./config";
import { throttleRAF } from "@/utils";
import { IPPTElement } from "@/types/element";
import { Line } from "./draw/line";
import { RichText } from "./draw/richText";
import { Shape } from "./draw/shape";
import { Picture } from "./draw/picture";
import Video from "./draw/video";
import History from "../editor/history";
import { Music } from "./draw/music";

export default class Stage {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public stageConfig: StageConfig;
    public container: HTMLDivElement;
    public history: History | undefined;

    private _line: Line | null;
    private _richText: RichText | null;
    private _shape: Shape | null;
    private _picture: Picture | null;
    private _video: Video | null;
    private _music: Music | null;
    constructor(
        container: HTMLDivElement,
        stageConfig: StageConfig,
        history?: History,
        resize?: boolean
    ) {
        this.container = container;
        this.stageConfig = stageConfig;
        this.history = history;

        const { canvas, ctx } = this._createStage();

        this.ctx = ctx;
        this.canvas = canvas;

        this._line = null;
        this._richText = null;
        this._shape = null;
        this._picture = null;
        this._video = null;
        this._music = null;

        if (resize) {
            setTimeout(() => {
                window.addEventListener(
                    "resize",
                    throttleRAF(this._resetStage.bind(this))
                );

                const resizeObserver = new ResizeObserver(throttleRAF(this._resetStage.bind(this)));

                resizeObserver.observe(this.container);
            }, 2000);
        }
    }

    private _resetStage() {
        const width = this.stageConfig.getWidth();
        const height = this.stageConfig.getHeight();
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        const dpr = window.devicePixelRatio;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.ctx.scale(dpr, dpr);

        this.stageConfig.resetBaseZoom();
    }

    private _createStage() {
        const width = this.stageConfig.getWidth();
        const height = this.stageConfig.getHeight();
        const canvas = document.createElement("canvas");
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.position = "absolute";
        this.container.appendChild(canvas);

        // 调整分辨率
        const dpr = window.devicePixelRatio;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.scale(dpr, dpr);

        return { ctx, canvas };
    }

    public clear() {
        const canvasWidth = this.stageConfig.getWidth();
        const canvasHeight = this.stageConfig.getHeight();
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    public async drawElement(element: IPPTElement, isThumbnail?: boolean) {
        switch (element.type) {
            case "shape": {
                if (!this._shape) this._shape = new Shape(this.stageConfig, this.ctx);
                this._shape.draw(element);
                break;
            }
            case "line": {
                if (!this._line) this._line = new Line(this.stageConfig, this.ctx);
                this._line.draw(element);
                break;
            }
            case "image": {
                if (!this._picture && this.history) this._picture = new Picture(this.stageConfig, this.ctx, this.history);
                await this._picture?.draw(element);
                break;
            }
            case "text": {
                if (!this._richText) this._richText = new RichText(this.stageConfig, this.ctx);
                this._richText!.draw(element);
                break;
            }
            case "video": {
                if (!this._video && this.history) this._video = new Video(this.stageConfig, this.ctx, this.history);
                await this._video?.draw(element, !!isThumbnail);
                break;
            }
            case "latex": {
                if (!this._picture && this.history) this._picture = new Picture(this.stageConfig, this.ctx, this.history);
                await this._picture?.draw(element);
                break;
            }
            case "audio": {
                if (!this._music && this.history) this._music = new Music(this.stageConfig, this.ctx);
                await this._music?.draw(element);
                break;
            }
            case "chart": {
                if (!this._picture && this.history) this._picture = new Picture(this.stageConfig, this.ctx, this.history);
                await this._picture?.draw(element);
                break;
            }
        }
    }

    public async drawElements(elements: IPPTElement[], isThumbnail?: boolean) {
        for (const element of elements) {
            // if (!this.stageConfig.operateElement || this.stageConfig.operateElement.id !== element.id) {
            //     this.drawElement(element);
            // }
            await this.drawElement(element, isThumbnail);
        }
    }
}
