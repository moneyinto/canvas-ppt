import Listener from "../listener";
import StageConfig from "./config";

export default class Stage {
    public ctx: CanvasRenderingContext2D;
    public stageConfig: StageConfig;

    public container: HTMLDivElement;
    public listener: Listener;
    constructor(container: HTMLDivElement, listener: Listener, stageConfig: StageConfig) {
        this.container = container;
        this.listener = listener;
        this.stageConfig = stageConfig;

        this.ctx = this._createStage();
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

        return ctx;
    }
}
