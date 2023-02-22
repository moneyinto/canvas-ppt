import { deepClone } from "@/utils";
import { baseFontConfig } from "../config/font";
import { VIEWPORT_SIZE, VIEWRATIO } from "../config/stage";
import Listener from "../listener";
import { ICacheImage, IRectParameter } from "../types";
import { ICreatingElement, IPPTElement, IPPTTextElement } from "../types/element";
import { IFontConfig, ILineData } from "../types/font";
import { ISlide } from "../types/slide";

export const TEXT_MARGIN = 5;

export default class StageConfig {
    public scrollX: number;
    public scrollY: number;
    public zoom: number;
    public canMove: boolean;
    public insertElement: ICreatingElement | null; // 需要绘制插入的元素
    public operateElement: IPPTElement | null; // 选中操作元素
    public opreateType: string; // 元素操作形式 拉伸方向 旋转
    public cacheImage: ICacheImage[];

    public slides: ISlide[] = [];
    public slideId = "";

    public fontConfig: IFontConfig = deepClone(baseFontConfig); // 富文本聚焦后前一个字体配置 或 默认配置
    public textFocus = false; // 富文本框是否聚焦 双击聚焦后才可以编辑
    // [开始字坐标，开始行坐标，结束字坐标，结束行坐标]
    public selectArea: [number, number, number, number] | null = null;

    public resetDrawView: (() => void) | null;
    public resetDrawOprate: (() => void) | null;
    public hideCursor:(() => void) | null;

    private _container: HTMLDivElement;
    private _listener: Listener | undefined;

    // 边距
    private _margin = 0;
    constructor(container: HTMLDivElement, listener?: Listener, margin?: number) {
        this._container = container;
        this._listener = listener;
        this._margin = margin || 0;
        this.scrollX = 0;
        this.scrollY = 0;
        this.zoom = this.getFitZoom();
        this.canMove = false;
        this.insertElement = null;
        this.operateElement = null;
        this.opreateType = "";
        this.cacheImage = [];

        this.resetDrawView = null;
        this.resetDrawOprate = null;
        this.hideCursor = null;
    }

    public setFontConfig(fontConfig: IFontConfig) {
        this.fontConfig = fontConfig;
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

        this._listener?.onZoomChange && this._listener.onZoomChange(this.zoom);
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

        this._listener?.onZoomChange && this._listener.onZoomChange(this.zoom);
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
        this._listener?.onInsertElementChange && this._listener.onInsertElementChange(element);
    }

    public updateElement(element: IPPTElement) {
        const slide = this.getCurrentSlide();
        const index = slide?.elements.findIndex(e => e.id === element.id);
        if (slide && slide.elements && typeof index !== "undefined" && index > -1) {
            slide.elements[index] = element;
        }
    }

    public setOperateElement(element: IPPTElement | null) {
        const operateElement = deepClone(element);
        this.operateElement = operateElement;
        if (!operateElement) {
            this.textFocus = false;
            this.hideCursor && this.hideCursor();
        }
        if (this._listener?.onSelectedChange) this._listener.onSelectedChange(operateElement);
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

    public addCacheImage(cacheImage: ICacheImage) {
        this.cacheImage.push(cacheImage);
    }

    public setSelectArea(selectArea: [number, number, number, number] | null) {
        this.selectArea = selectArea;
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
        // if (this.operateElement) {
        //     const element = this.operateElement;
        //     if (element.type === "line") {
        //         if (this.checkPointNearLine(
        //             [left, top],
        //             [
        //                 element.left + element.start[0],
        //                 element.top + element.start[1]
        //             ],
        //             [
        //                 element.left + element.end[0],
        //                 element.top + element.end[1]
        //             ]
        //         )) {
        //             return element;
        //         }
        //     } else {
        //         const cx = element.left + element.width / 2;
        //         const cy = element.top + element.height / 2;
        //         const rect: IRectParameter = [
        //             element.left,
        //             element.top,
        //             element.width,
        //             element.height
        //         ];
        //         if (
        //             this.checkPointInRect(
        //                 left,
        //                 top,
        //                 rect,
        //                 cx,
        //                 cy,
        //                 (element.rotate / 180) * Math.PI
        //             )
        //         ) {
        //             return element;
        //         }
        //     }
        // }

        const currentSlide = this.getCurrentSlide();
        const elements: IPPTElement[] = deepClone(currentSlide?.elements || []);
        return elements.reverse().find((element) => {
            if (element.type === "line") {
                return this.checkPointNearLine(
                    [left, top],
                    [
                        element.left + element.start[0],
                        element.top + element.start[1]
                    ],
                    [
                        element.left + element.end[0],
                        element.top + element.end[1]
                    ]
                );
            } else {
                const cx = element.left + element.width / 2;
                const cy = element.top + element.height / 2;
                const rect: IRectParameter = [
                    element.left,
                    element.top,
                    element.width,
                    element.height
                ];
                return this.checkPointInRect(
                    left,
                    top,
                    rect,
                    cx,
                    cy,
                    (element.rotate / 180) * Math.PI,
                    element.type === "text" ? 1 : element.flipH || 1,
                    element.type === "text" ? 1 : element.flipV || 1
                );
            }
        });
    }

    public checkPointNearLine(
        point: [number, number],
        start: [number, number],
        end: [number, number]
    ) {
        const distance = 0.2;
        const A = start;
        const B = end;
        // 与A点的距离
        const rA = Math.hypot(A[0] - point[0], A[1] - point[1]);
        // 与B点的距离
        const rB = Math.hypot(B[0] - point[0], B[1] - point[1]);
        // AB点距离
        const rAB = Math.hypot(A[0] - B[0], A[1] - B[1]);
        // 判断条件 -- 与A点距离 与B点距离 两者之和 与 AB点距离 的差 小于 distance
        // 三个条件满足一个即为符合要求的元素
        return rA + rB - rAB < distance;
    }

    public checkPointInRect(
        x: number,
        y: number,
        rect: IRectParameter,
        cx: number,
        cy: number,
        angle: number,
        flipH: number,
        flipV: number
    ) {
        const nx = flipH === 1 ? x : (2 * cx - x);
        const ny = flipV === 1 ? y : (2 * cy - y);
        const translatePoint = this.rotate(nx, ny, cx, cy, -angle);
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

    public getRenderContent(element: IPPTTextElement) {
        const width = element.width - TEXT_MARGIN * 2;
        const renderContent: ILineData[] = [];
        let lineData: ILineData = {
            height: 0,
            width: 0,
            texts: []
        };
        let countWidth = 0;
        element.content.forEach((text) => {
            if (lineData.height === 0) lineData.height = text.fontSize;
            if (text.value === "\n") {
                lineData.texts.push(text);
                renderContent.push(lineData);
                lineData = {
                    height: 0,
                    width: 0,
                    texts: []
                };
                countWidth = 0;
            } else if (countWidth + text.width < width) {
                // 一行数据可以摆得下
                lineData.texts.push(text);
                if (lineData.height < text.fontSize) lineData.height = text.fontSize;
                countWidth = countWidth + text.width + element.wordSpace;
                lineData.width = countWidth;
            } else {
                renderContent.push(lineData);
                lineData = {
                    height: text.fontSize,
                    width: text.width,
                    texts: [text]
                };
                countWidth = text.width + element.wordSpace;
            }
        });
        return renderContent;
    }

    public getAlignOffsetX(line: ILineData, element: IPPTTextElement) {
        const align = element.align;
        return {
            left: 0,
            center: (element.width - TEXT_MARGIN * 2 - line.width) / 2,
            right: element.width - TEXT_MARGIN * 2 - line.width
        }[align];
    }

    public getSelectArea(selectArea: [number, number, number, number], element: IPPTTextElement) {
        const renderContent = this.getRenderContent(element);
        let startX = 0;
        let endX = 0;
        let startOk = false;
        let endOk = false;
        renderContent.forEach((lineData, index) => {
            if (selectArea[1] === index) {
                // 起始位置属于当前行
                startX += selectArea[0];
                startOk = true;
            } else if (!startOk) {
                startX += lineData.texts.length;
            }

            if (selectArea[3] === index) {
                // 结束位置属于当前行
                endX += selectArea[2];
                endOk = true;
            } else if (!endOk) {
                endX += lineData.texts.length;
            }
        });

        return {
            startX,
            endX
        };
    }

    public getRenderSelect(
        x: number,
        y: number,
        lineData: ILineData,
        index: number,
        selectArea: [number, number, number, number],
        element: IPPTTextElement
    ) {
        if (index >= selectArea[1] && index <= selectArea[3]) {
            let startX = 0;
            let endX = 0;
            if (selectArea[1] === selectArea[3]) {
                // 仅选中该行
                startX = selectArea[0];
                endX = selectArea[2];
            } else if (selectArea[1] === index) {
                // 选中的第一行
                startX = selectArea[0];
                endX = lineData.texts.length;
            } else if (index < selectArea[3]) {
                // 选中中间的行
                startX = 0;
                endX = lineData.texts.length;
            } else if (index === selectArea[3]) {
                // 选中的最后一行
                startX = 0;
                endX = selectArea[2];
            }

            if (startX === endX) return undefined;

            // 存在选中区域
            if (startX > 0) {
                x += lineData.texts
                    .slice(0, startX)
                    .map((text) => text.width)
                    .reduce((acr, cur) => {
                        return acr + cur + element.wordSpace;
                    });
            }

            const width = lineData.texts
                .slice(startX, endX)
                .map((text) => text.width)
                .reduce((acr, cur) => {
                    return acr + cur + element.wordSpace;
                });

            const offsetX = this.getAlignOffsetX(lineData, element);
            return {
                x: x + offsetX,
                y,
                width: width + element.wordSpace,
                height: lineData.height * element.lineHeight
            };
        }
        return undefined;
    }
}
