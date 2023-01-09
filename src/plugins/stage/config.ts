import { VIEWPORT_SIZE, VIEWRATIO } from "../config/stage";
import Listener from "../listener";
import {
    ICreatingElement,
    IElementPosition,
    IPPTElement
} from "../types/element";
import { ISlide } from "../types/slide";

export default class StageConfig {
    public scrollX: number;
    public scrollY: number;
    public zoom: number;
    public canMove: boolean;
    public insertElement: ICreatingElement | null; // 需要绘制插入的元素

    public slides: ISlide[] = [];
    public slideId = "";

    public resetDraw: (() => void) | null;

    private _container: HTMLDivElement;
    private _listener: Listener;

    // 边距
    private _margin = 40;
    constructor(container: HTMLDivElement, listener: Listener) {
        this._container = container;
        this._listener = listener;
        this.scrollX = 0;
        this.scrollY = 0;
        this.zoom = this.getFitZoom();
        this.canMove = false;
        this.insertElement = null;

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

        this._listener.onZoomChange && this._listener.onZoomChange(this.zoom);
    }

    public getWidth() {
        return this._container.clientWidth;
    }

    public getHeight() {
        return this._container.clientHeight;
    }

    public getFitZoom() {
        const width = this.getWidth();
        const height = this.getHeight();

        let stageWidth = 0;
        let stageHeight = 0;
        if (height / width > VIEWRATIO) {
            // 以宽度为限制值
            stageWidth = width - this._margin * 2;
        } else {
            stageHeight = height - this._margin * 2;
            stageWidth = stageHeight / VIEWRATIO;
        }

        return stageWidth / VIEWPORT_SIZE;
    }

    public resetBaseZoom() {
        this.zoom = this.getFitZoom();

        this.scrollX = 0;
        this.scrollY = 0;

        this.resetDraw && this.resetDraw();

        this._listener.onZoomChange && this._listener.onZoomChange(this.zoom);
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

    // 获取画布偏移量
    public getCanvasOffset() {
        return {
            offsetX: this._container.offsetLeft,
            offsetY: this._container.offsetTop
        };
    }

    public getStageOrigin() {
        const { x, y } = this.getStageArea();
        return { x: x / this.zoom, y: y / this.zoom };
    }

    public setCanMove(canMove: boolean) {
        this.canMove = canMove;
        if (canMove) {
            this._container.style.cursor = "grabbing";
        } else {
            this._container.style.cursor = "default";
        }
    }

    public setInsertElement(element: ICreatingElement | null) {
        if (element) {
            this._container.style.cursor = "crosshair";
        } else {
            this._container.style.cursor = "default";
        }
        this.insertElement = element;
    }

    public addElement(element: IPPTElement) {
        const slide = this.getCurrentSlide();
        slide?.elements.push(element);

        this.resetDraw && this.resetDraw();
    }

    public setSildes(slides: ISlide[]) {
        this.slides = slides;
    }

    public setSlideId(slideId: string) {
        this.slideId = slideId;
    }

    public getCurrentSlide() {
        return this.slides.find((slide) => this.slideId === slide.id);
    }

    // 获取当前页元素排序后的元素列表 1 正序 -1 倒序
    public getSortElements(elements: IPPTElement[], sort: 1 | -1) {
        return elements.sort((a, b) => {
            return ((a.zIndex || 0) - (b.zIndex || 0)) * sort;
        });
    }

    /**
     * 旋转坐标点
     */
    public rotate(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        angle: number
    ) {
        // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
        // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
        // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
        return [
            (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
            (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2
        ];
    }

    // 获取鼠标位置的元素
    public getMouseInElement(left: number, top: number) {
        const currentSlide = this.getCurrentSlide();
        const elements = this.getSortElements(currentSlide?.elements || [], -1);
        return elements.find((element) => {
            let translatePoint = [left, top];
            if (element.rotate !== 0) {
                // 存在旋转角度需要进行转换
                const cx = (element.left + element.width) / 2;
                const cy = (element.top + element.height) / 2;
                translatePoint = this.rotate(left, top, cx, cy, -element.rotate / 360 * Math.PI);
            }

            return (
                element.top < translatePoint[1] &&
                element.left < translatePoint[0] &&
                element.top + element.height > translatePoint[1] &&
                element.left + element.width > translatePoint[0]
            );
        });
    }
}
