import Listener from "../listener";
import StageConfig from "./config";
import { throttle } from "lodash";
import { IPPTElement, IPPTShapeElement } from "../types/slide";

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

    public drawElement(element: IPPTElement) {
        const zoom = this.stageConfig.zoom;
        const { x, y } = this.stageConfig.getStageOrigin();

        this.ctx.save();

        // 缩放画布
        this.ctx.scale(zoom, zoom);

        const ox = x + element.left + element.width / 2;
        const oy = y + element.top + element.height / 2;

        // 平移坐标原点
        this.ctx.translate(ox, oy);
        // 旋转画布
        this.ctx.rotate(element.rotate / 360 * Math.PI);

        switch (element.type) {
        case "shape": {
            this.drawShape(element);
            break;
        }
        }

        this.ctx.restore();
    }

    public drawShape(element: IPPTShapeElement) {
        switch (element.shape) {
        case "rect": {
            this.drawRectShape(element);
            break;
        }
        }
    }

    public drawRectShape(element: IPPTShapeElement) {
        const offsetX = -element.width / 2;
        const offsetY = -element.height / 2;

        this.ctx.fillStyle = element.fill;
        this.ctx.fillRect(offsetX, offsetY, element.width, element.height);

        if (element.outline) {
            const lineWidth = element.outline.width || 2;
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = element.outline.color || "#000";
            if (element.outline.style === "dashed") {
                this.ctx.setLineDash([8 * lineWidth / 2, 4 * lineWidth / 2]);
            }
            this.ctx.strokeRect(offsetX, offsetY, element.width, element.height);
        }
    }
}
