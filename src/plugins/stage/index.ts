import Listener from "../listener";
import StageConfig from "./config";
import { throttle } from "lodash";
import { IPPTShapeElement } from "../types/slide";

export default class Stage {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public stageConfig: StageConfig;
    public container: HTMLDivElement;
    public listener: Listener;
    constructor(container: HTMLDivElement, listener: Listener, stageConfig: StageConfig) {
        this.container = container;
        this.listener = listener;
        this.stageConfig = stageConfig;

        const { canvas, ctx } = this._createStage();

        this.ctx = ctx;
        this.canvas = canvas;
        window.addEventListener("resize", throttle(this._resetStage.bind(this), 50));
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
        const ctx = canvas.getContext("2d")!;
        ctx.scale(dpr, dpr);

        return { ctx, canvas };
    }

    public drawShape(element: IPPTShapeElement) {
        const scaleX = element.width / element.viewBox;
        const scaleY = element.height / element.viewBox;
        const zoom = this.stageConfig.zoom;
        const { x, y } = this.stageConfig.getStageArea();

        this.ctx.save();

        this.ctx.translate(x, y);
        this.ctx.scale(scaleX * zoom, scaleY * zoom);

        this.ctx.fillStyle = element.fill;
        const path = new Path2D(element.path);
        this.ctx.fill(path);

        if (element.outline) {
            // this.ctx.setLineDash([8, 8]);
            this.ctx.stroke(path);
        }

        this.ctx.restore();
    }
}
