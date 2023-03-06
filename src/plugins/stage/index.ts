import StageConfig from "./config";
import { throttleRAF } from "@/utils";
import { IPPTElement } from "../types/element";
import { Line } from "./draw/line";
import { RichText } from "./draw/richText";
import { Shape } from "./draw/shape";
import { Picture } from "./draw/picture";

export default class Stage {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public stageConfig: StageConfig;
    public container: HTMLDivElement;

    private _line: Line;
    private _richText: RichText;
    private _shape: Shape;
    private _picture: Picture;
    constructor(
        container: HTMLDivElement,
        stageConfig: StageConfig,
        resize?: boolean
    ) {
        this.container = container;
        this.stageConfig = stageConfig;

        const { canvas, ctx } = this._createStage();

        this.ctx = ctx;
        this.canvas = canvas;

        this._line = new Line(this.stageConfig, this.ctx);
        this._richText = new RichText(this.stageConfig, this.ctx);
        this._shape = new Shape(this.stageConfig, this.ctx);
        this._picture = new Picture(this.stageConfig, this.ctx);

        if (resize) {
            window.addEventListener(
                "resize",
                throttleRAF(this._resetStage.bind(this))
            );
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

    public drawElement(element: IPPTElement) {
        switch (element.type) {
            case "shape": {
                this._shape.draw(element);
                break;
            }
            case "line": {
                this._line.draw(element);
                break;
            }
            case "image": {
                this._picture.draw(element);
                break;
            }
            case "text": {
                this._richText.draw(element);
                break;
            }
        }
    }

    public drawElements(elements: IPPTElement[]) {
        elements.forEach(element => {
            // if (!this.stageConfig.operateElement || this.stageConfig.operateElement.id !== element.id) {
            //     this.drawElement(element);
            // }
            this.drawElement(element);
        });
    }
}
