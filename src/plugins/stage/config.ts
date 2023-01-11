import { deepClone } from "@/utils";
import { VIEWPORT_SIZE, VIEWRATIO } from "../config/stage";
import Listener from "../listener";
import { IRectParameter } from "../types";
import { ICreatingElement, IPPTElement } from "../types/element";
import { ISlide } from "../types/slide";

export default class StageConfig {
    public scrollX: number;
    public scrollY: number;
    public zoom: number;
    public canMove: boolean;
    public insertElement: ICreatingElement | null; // 需要绘制插入的元素
    public operateElement: IPPTElement | null; // 选中操作元素
    public opreateType: string; // 元素操作形式 拉伸方向 旋转

    public slides: ISlide[] = [];
    public slideId = "";

    public resetDrawView: (() => void) | null;
    public resetDrawOprate: (() => void) | null;

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
        this.operateElement = null;
        this.opreateType = "";

        this.resetDrawView = null;
        this.resetDrawOprate = null;
    }

    public resetCheckDrawView() {
        this.resetDrawView && this.resetDrawView();
    }

    public resetCheckDrawOprate() {
        this.resetDrawOprate && this.resetDrawOprate();
    }

    public setScroll(x: number, y: number) {
        this.scrollX = x;
        this.scrollY = y;

        this.resetCheckDrawView();
        this.resetCheckDrawOprate();
    }

    public setZoom(zoom: number) {
        this.zoom = zoom;

        this.resetCheckDrawView();
        this.resetCheckDrawOprate();

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

        this.resetCheckDrawView();
        this.resetCheckDrawOprate();

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

    public setOperateElement(element: IPPTElement | null) {
        this.operateElement = deepClone(element);
    }

    public setOperateType(opreateType: string) {
        this.opreateType = opreateType;
    }

    public addElement(element: IPPTElement) {
        const slide = this.getCurrentSlide();
        slide?.elements.push(element);
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
        // 当存在操作选中元素是时，因为选中元素处于层级最高，优先判断选中元素
        if (this.operateElement) {
            const element = this.operateElement;
            const cx = element.left + element.width / 2;
            const cy = element.top + element.height / 2;
            const rect: IRectParameter = [element.left, element.top, element.width, element.height];
            if (this.checkPointInRect(left, top, rect, cx, cy, element.rotate / 180 * Math.PI)) return element;
        }

        const currentSlide = this.getCurrentSlide();
        const elements = this.getSortElements(currentSlide?.elements || [], -1);
        return elements.find((element) => {
            const cx = element.left + element.width / 2;
            const cy = element.top + element.height / 2;
            const rect: IRectParameter = [element.left, element.top, element.width, element.height];
            return this.checkPointInRect(left, top, rect, cx, cy, element.rotate / 180 * Math.PI);
        });
    }

    public checkPointInRect(
        x: number,
        y: number,
        rect: IRectParameter,
        cx: number,
        cy: number,
        angle: number
    ) {
        const translatePoint = this.rotate(
            x,
            y,
            cx,
            cy,
            -angle
        );
        const minX = rect[0];
        const maxX = rect[0] + rect[2];
        const minY = rect[1];
        const maxY = rect[1] + rect[3];
        return (
            translatePoint[0] > minX &&
            translatePoint[0] < maxX &&
            translatePoint[1] > minY &&
            translatePoint[1] < maxY
        );
    }
}
