import { VIEWPORT_SIZE, VIEWRATIO } from "../config/stage";

export default class StageConfig {
    public scrollX: number;
    public scrollY: number;
    public zoom: number;

    public resetDraw: (() => void) | null;

    private _container: HTMLDivElement;

    constructor(container: HTMLDivElement) {
        this._container = container;
        this.scrollX = 0;
        this.scrollY = 0;
        this.zoom = this._getZoom();

        this.resetDraw = null;
    }

    public setScroll(x: number, y: number) {
        this.scrollX = x;
        this.scrollY = y;

        this.resetDraw && this.resetDraw();
    }

    public setZoom(zoom: number) {
        this.zoom = zoom;

        this.resetDraw && this.resetDraw();
    }

    public getWidth() {
        return this._container.clientWidth;
    }

    public getHeight() {
        return this._container.clientHeight;
    }

    private _getZoom() {
        const width = this.getWidth();
        const height = this.getHeight();

        const margin = 40;

        let stageWidth = 0;
        let stageHeight = 0;
        if (height / width > VIEWRATIO) {
            // 以宽度为限制值
            stageWidth = width - margin * 2;
        } else {
            stageHeight = height - margin * 2;
            stageWidth = stageHeight / VIEWRATIO;
        }
        return stageWidth / VIEWPORT_SIZE;
    }

    public resetBaseZoom() {
        this.zoom = this._getZoom();

        this.scrollX = 0;
        this.scrollY = 0;

        this.resetDraw && this.resetDraw();
    }

    public getStageArea() {
        const width = this.getWidth();
        const height = this.getHeight();

        const stageWidth = VIEWPORT_SIZE * this.zoom;
        const stageHeight = VIEWPORT_SIZE * VIEWRATIO * this.zoom;
        const x = (width - stageWidth) / 2 - this.scrollX;
        const y = (height - stageHeight) / 2 - this.scrollY;

        return { x, y, stageWidth, stageHeight };
    }
}
