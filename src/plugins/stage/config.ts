import { deepClone } from "@/utils";
import { getShapePath } from "@/utils/shape";
import { baseFontConfig } from "@/config/font";
import { VIEWPORT_SIZE, VIEWRATIO } from "@/config/stage";
import Listener from "../editor/listener";
import { ICacheImage, IRectParameter } from "@/types";
import { ICreatingElement, IPPTElement, IPPTShapeElement, IPPTTableCell, IPPTTableElement, IPPTTextElement } from "@/types/element";
import { IFontConfig, IFontData, ILineData } from "@/types/font";
import { IPPTAnimation, IPPTTurningAnimation, ISlide, ISlideBackground } from "@/types/slide";

export const TEXT_MARGIN = 5;

export default class StageConfig {
    public scrollX: number;
    public scrollY: number;
    public zoom: number;
    public canMove: boolean;
    public insertElement: ICreatingElement | null; // 需要绘制插入的元素
    public operateElements: IPPTElement[]; // 选中操作元素
    public opreateType: string; // 元素操作形式 拉伸方向 旋转
    public cacheImages: ICacheImage[];
    public cacheVideo: Map<string, HTMLVideoElement>;

    public isFullScreen = false;
    public autoVideoRender = false;

    public slides: ISlide[] = [];
    public slideId = "";

    public fontConfig: IFontConfig = deepClone(baseFontConfig); // 富文本聚焦后前一个字体配置 或 默认配置
    public textFocus = false; // 富文本框是否聚焦 双击聚焦后才可以编辑
    public textFocusElementId = ""; // 聚焦富文本框元素id
    // [开始字坐标，开始行坐标，结束字坐标，结束行坐标]
    public selectArea: [number, number, number, number] | null = null;
    // 表格编辑状态
    public tableEditElementID = "";
    // 表格选中单元格 [[开始行，开始列], [结束行，结束列]
    public tableSelectCells: [[number, number], [number, number]] | null = null;

    public resetDrawView: (() => void) | null;
    public resetDrawOprate: (() => void) | null;
    public hideCursor: () => void;
    public getFontSize: ((text: IFontData) => { width: number, height: number }) | null;

    // 动画执行指针
    public animationIndex = -1;
    // 动画元素隐藏集合
    public animationHideElements: string[] = [];
    // 当前执行的动画集合
    public actionAnimations: IPPTAnimation[][] = [];
    // 判断元素动画是否正在执行
    public isElementAnimation = false;
    // 判断切页动画是否正在执行
    public isTurningAnimation = false;
    // 动画执行时间
    public animationTime = 0;
    // 动画执行累计时间
    public animationCountTime = 0;
    // 切页动画
    public turningAni: IPPTTurningAnimation | null = null;

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
        this.operateElements = [];
        this.opreateType = "";
        this.cacheImages = [];
        this.cacheVideo = new Map();

        this.resetDrawView = null;
        this.resetDrawOprate = null;
        this.hideCursor = () => {};
        this.getFontSize = null;
    }

    public setFontConfig(fontConfig: IFontConfig) {
        this.fontConfig = fontConfig;
    }

    public async resetCheckDrawView() {
        this.resetDrawView && await this.resetDrawView();
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

        this._listener?.onZoomChange(this.zoom);
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

        this._listener?.onZoomChange(this.zoom);
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
        this._listener?.onInsertElementChange(element);
    }

    public updateElement(element: IPPTElement) {
        const slide = this.getCurrentSlide();
        const index = slide?.elements.findIndex(e => e.id === element.id);
        if (slide && slide.elements && typeof index !== "undefined" && index > -1) {
            slide.elements[index] = element;
        }
    }

    public updateElements(elements: IPPTElement[]) {
        const slide = this.getCurrentSlide();
        if (slide && slide.elements && elements.length > 0) {
            for (const element of elements) {
                const index = slide?.elements.findIndex(e => e.id === element.id);
                if (index > -1) {
                    slide.elements[index] = element;
                }
            }
        }
    }

    public getElementBoundary(element: IPPTElement) {
        const boundary = [0, 0, 0, 0];
        if (element.type === "line") {
            boundary[0] = Math.min(element.left + element.start[0], element.left + element.end[0]);
            boundary[1] = Math.min(element.top + element.start[1], element.top + element.end[1]);
            boundary[2] = Math.max(element.left + element.start[0], element.left + element.end[0]);
            boundary[3] = Math.max(element.top + element.start[1], element.top + element.end[1]);
        } else if (element.rotate === 0) {
            boundary[0] = element.left;
            boundary[1] = element.top;
            boundary[2] = element.left + element.width;
            boundary[3] = element.top + element.height;
        } else {
            const cx = element.left + element.width / 2;
            const cy = element.top + element.height / 2;
            const rect1 = this.rotate(element.left, element.top, cx, cy, element.rotate);
            const rect2 = this.rotate(element.left + element.width, element.top, cx, cy, element.rotate);
            const rect3 = this.rotate(element.left, element.top + element.height, cx, cy, element.rotate);
            const rect4 = this.rotate(element.left + element.width, element.top + element.height, cx, cy, element.rotate);
            boundary[0] = Math.min(rect1[0], rect2[0], rect3[0], rect4[0]);
            boundary[1] = Math.min(rect1[1], rect2[1], rect3[1], rect4[1]);
            boundary[2] = Math.max(rect1[0], rect2[0], rect3[0], rect4[0]);
            boundary[3] = Math.max(rect1[1], rect2[1], rect3[1], rect4[1]);
        }

        return boundary;
    }

    public getOperateElementsBoundary(elements: IPPTElement[]) {
        let boundary = [0, 0, 0, 0];
        for (const [index, element] of elements.entries()) {
            if (index === 0) {
                boundary = this.getElementBoundary(element);
            } else {
                const boundary1 = this.getElementBoundary(element);
                boundary[0] = Math.min(boundary[0], boundary1[0]);
                boundary[1] = Math.min(boundary[1], boundary1[1]);
                boundary[2] = Math.max(boundary[2], boundary1[2]);
                boundary[3] = Math.max(boundary[3], boundary1[3]);
            }
        }

        return boundary;
    }

    public setOperateElement(element: IPPTElement | null | undefined, multiple: boolean) {
        const operateElement = deepClone(element);
        if (!operateElement) {
            this.operateElements = [];
            this.textFocus = false;
            this.textFocusElementId = "";
            this.hideCursor && this.hideCursor();
        } else {
            if (multiple) {
                // 多选
                const index = this.operateElements.findIndex(element => element.id === operateElement.id);
                if (index === -1) {
                    this.operateElements.push(operateElement);
                } else {
                    // 当多选存在时进行取消
                    this.operateElements.splice(index, 1);
                }
            } else {
                this.operateElements = [operateElement];
            }
        }
        this._listener?.onSelectedChange(this.operateElements);
    }

    public updateOperateElements(elements: IPPTElement[]) {
        this.operateElements = elements;
        this._listener?.onSelectedChange(this.operateElements);
    }

    public setBackground(background: ISlideBackground | undefined) {
        const currentSlide = this.getCurrentSlide();
        if (currentSlide) {
            if (background) {
                currentSlide.background = background;
            } else {
                delete currentSlide.background;
            }

            const index = this.slides.findIndex(slide => slide.id === currentSlide.id);
            this.slides[index] = currentSlide;
        }
    }

    public applyBackgroundAll() {
        const currentSlide = this.getCurrentSlide();
        if (currentSlide?.background) {
            this.slides.forEach(slide => {
                slide.background = currentSlide.background;
                this._listener?.onUpdateThumbnailSlide(slide);
            });
        }
    }

    public setOperateType(opreateType: string) {
        this.opreateType = opreateType;
    }

    public addElement(element: IPPTElement) {
        const slide = this.getCurrentSlide();
        slide?.elements.push(element);
    }

    public setSlides(slides: ISlide[]) {
        this.slides = slides;
    }

    public setSlideId(slideId: string) {
        this.slideId = slideId;
    }

    public getCurrentSlide() {
        return this.slides.find((slide) => this.slideId === slide.id);
    }

    public getElementById(id: string) {
        const slide = this.getCurrentSlide();
        return slide?.elements.find((element) => element.id === id);
    }

    public addCacheImage(cacheImage: ICacheImage) {
        this.cacheImages.push(cacheImage);
    }

    public clearCacheImages() {
        this.cacheImages = [];
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
    ): [number, number] {
        // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
        // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
        // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
        return [
            (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
            (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2
        ];
    }

    public getMousePosition(evt: MouseEvent) {
        const zoom = this.zoom;

        const { x, y } = this.getStageArea();
        const { offsetX, offsetY } = this.getCanvasOffset();

        const left = (evt.pageX - x - offsetX) / zoom;
        const top = (evt.pageY - y - offsetY) / zoom;

        return { left, top };
    }

    public getMouseTableCell(element: IPPTTableElement, left: number, top: number) {
        const x = left - element.left;
        const y = top - element.top;
        const rowHeights = element.rowHeights.map(item => item * element.height);
        const colWidths = element.colWidths.map(item => item * element.width);
        let row = -1;
        let col = -1;
        let totalHeight = 0;
        for (const [rowIndex, rowData] of element.data.entries()) {
            row = -1;
            col = -1;
            let totalWidth = 0;
            let rowHeight = 0;
            for (const [colIndex, cellData] of rowData.entries()) {
                if (cellData.rowspan > 0) {
                    rowHeight = totalHeight + rowHeights.slice(rowIndex, rowIndex + cellData.rowspan).reduce((total, curr) => total + curr, 0);
                }
                if (cellData.colspan > 0) {
                    const colWidth = colWidths.slice(colIndex, colIndex + cellData.colspan).reduce((total, curr) => total + curr, 0);
                    totalWidth += colWidth;
                }

                if (x < totalWidth) {
                    col = colIndex;
                    break;
                }
            }
            if (y < rowHeight) {
                row = rowIndex;
            }
            totalHeight += rowHeights[rowIndex];
            if (col >= 0 && row >= 0) break;
        }

        return { row, col };
    }

    // 获取鼠标位置的元素
    public getMouseInElement(left: number, top: number, ctx: CanvasRenderingContext2D, checkElements: IPPTElement[]) {
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

        const elements: IPPTElement[] = deepClone(checkElements);
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
                const isInRect = this.checkPointInRect(
                    left,
                    top,
                    rect,
                    cx,
                    cy,
                    (element.rotate / 180) * Math.PI
                );

                if (element.type === "shape" && isInRect) {
                    const path = getShapePath(element.shape, element.width, element.height) as Path2D;
                    ctx.save();
                    // 缩放画布
                    // ctx.scale(this.zoom, this.zoom);
                    const { x, y } = this.getStageOrigin();
                    const ox = x + element.left + element.width / 2;
                    const oy = y + element.top + element.height / 2;

                    // 平移坐标原点
                    ctx.translate(ox, oy);
                    // // 旋转画布
                    ctx.rotate((element.rotate / 180) * Math.PI);
                    // // 水平垂直翻转
                    ctx.scale(element.flipH || 1, element.flipV || 1);
                    const isPointInPath = ctx.isPointInPath(path, left + x, top + y);
                    ctx.restore();
                    return isPointInPath;
                }

                return isInRect;
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
        angle: number
    ) {
        const translatePoint = this.rotate(x, y, cx, cy, -angle);
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

    // 获取表格对应单元格数据
    public getTableCellData(element: IPPTTableElement, row: number, col: number) {
        const tableCell = element.data[row][col];
        const rowHeights = element.rowHeights.map(item => item * element.height);
        const colWidths = element.colWidths.map(item => item * element.width);
        const tableCellLeft = colWidths.slice(0, col).reduce((a, b) => a + b, 0);
        const tableCellTop = rowHeights.slice(0, row).reduce((a, b) => a + b, 0);
        const tableCellWidth = colWidths.slice(col, col + tableCell.colspan).reduce((a, b) => a + b, 0);
        const tableCellHeight = rowHeights.slice(row, row + tableCell.rowspan).reduce((a, b) => a + b, 0);
        return { tableCellLeft, tableCellTop, tableCellWidth, tableCellHeight };
    }

    // 获取文本变更后文本框高度
    public getTextHeight(operateElement: IPPTTextElement | IPPTShapeElement | IPPTTableElement, tableCellPosition?: [number, number]) {
        const renderContent = this.getRenderContent(operateElement, tableCellPosition);
        let height = TEXT_MARGIN * 2;
        let textElement: IPPTTextElement | IPPTShapeElement | IPPTTableCell | null = null;
        if (
            operateElement.type === "table" &&
            ((this.tableSelectCells && this.tableSelectCells.length > 0) || tableCellPosition)
        ) {
            const row = tableCellPosition ? tableCellPosition[0] : this.tableSelectCells![0][0];
            const col = tableCellPosition ? tableCellPosition[1] : this.tableSelectCells![0][1];
            const tableCell = operateElement.data[row][col];
            textElement = tableCell;
        } else {
            textElement = operateElement as IPPTTextElement | IPPTShapeElement;
        }
        renderContent.forEach((line) => {
            height += line.height * textElement!.lineHeight;
        });
        return height;
    }

    public getRenderContent(element: IPPTTextElement | IPPTShapeElement | IPPTTableElement, tableCellPosition?: [number, number]) {
        // ！！！文本可能由于TEXT_MARGIN的原因，导致宽度不够，需要换行, 但是没有边距，又会有点贴边，后面进行调整
        let width = element.width - TEXT_MARGIN * 2;

        let textElement: IPPTTextElement | IPPTShapeElement | IPPTTableCell | null = null;

        if (
            element.type === "table" &&
            ((this.tableSelectCells && this.tableSelectCells.length > 0) || tableCellPosition)
        ) {
            const row = tableCellPosition ? tableCellPosition[0] : this.tableSelectCells![0][0];
            const col = tableCellPosition ? tableCellPosition[1] : this.tableSelectCells![0][1];
            const tableCell = element.data[row][col];
            const { tableCellWidth } = this.getTableCellData(element, row, col);
            width = tableCellWidth - TEXT_MARGIN * 2;

            textElement = tableCell;
        } else {
            textElement = element as IPPTTextElement | IPPTShapeElement;
        }

        const renderContent: ILineData[] = [];
        let lineData: ILineData = {
            height: 0,
            width: 0,
            texts: []
        };
        let countWidth = 0;
        textElement.content.forEach((text) => {
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
                countWidth = countWidth + text.width + textElement!.wordSpace;
                lineData.width = countWidth;
            } else {
                renderContent.push(lineData);
                lineData = {
                    height: text.fontSize,
                    width: text.width,
                    texts: [text]
                };
                countWidth = text.width + textElement!.wordSpace;
            }
        });
        return renderContent;
    }

    public getAlignOffsetX(line: ILineData, element: IPPTTextElement | IPPTShapeElement | IPPTTableElement, tableCellPosition?: [number, number]) {
        let align: "left" | "center" | "right" = "center";
        let width = 0;
        if (element.type === "table") {
            let row = 0;
            let col = 0;
            if (tableCellPosition) {
                row = tableCellPosition[0];
                col = tableCellPosition[1];
            } else if (this.tableSelectCells && this.tableSelectCells.length > 0) {
                row = this.tableSelectCells[0][0];
                col = this.tableSelectCells[0][1];
            }
            const tableCell = element.data[row][col];
            const { tableCellWidth } = this.getTableCellData(element, row, col);
            align = tableCell.align || "center";
            width = tableCellWidth;
        } else {
            align = element.align || "center";
            width = element.width;
        }

        return {
            left: 0,
            center: (width - TEXT_MARGIN * 2 - line.width) / 2,
            right: width - TEXT_MARGIN * 2 - line.width
        }[align];
    }

    public getSelectArea(selectArea: [number, number, number, number], element: IPPTTextElement | IPPTShapeElement | IPPTTableElement) {
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
        element: IPPTTextElement | IPPTShapeElement | IPPTTableElement,
        tableCellPosition?: [number, number]
    ) {
        let textElement: IPPTTextElement | IPPTShapeElement | IPPTTableCell | null = null;
        if (element.type === "table" && tableCellPosition) {
            const tableCell = element.data[tableCellPosition[0]][tableCellPosition[1]];
            textElement = tableCell;
        } else {
            textElement = element as IPPTTextElement | IPPTShapeElement;
        }

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
                        return acr + cur + textElement!.wordSpace;
                    });
            }

            const width = lineData.texts
                .slice(startX, endX)
                .map((text) => text.width)
                .reduce((acr, cur) => {
                    return acr + cur + textElement!.wordSpace;
                });

            let offsetX = this.getAlignOffsetX(lineData, element);

            let offsetY = 0;
            if (element.type === "shape" || element.type === "table") {
                const height = this.getTextHeight(element, tableCellPosition);
                offsetY = (element.height - height) / 2;
                if (element.type === "table" && tableCellPosition) {
                    const [row, col] = tableCellPosition;
                    const { tableCellHeight, tableCellLeft, tableCellTop } = this.getTableCellData(element, row, col);
                    offsetX += tableCellLeft;
                    offsetY = tableCellHeight / 2 - height / 2 + tableCellTop;
                }
            }

            return {
                x: x + offsetX,
                y: y + offsetY,
                width: width + textElement!.wordSpace,
                height: lineData.height * textElement!.lineHeight
            };
        }
        return undefined;
    }

    // 初始化动画指针及隐藏元素的集合
    initSlideAnimation(currentSlide: ISlide) {
        this.animationIndex = -1;
        // 为了兼容编辑情况下执行动画
        this.setSlides([currentSlide]);
        this.setSlideId(currentSlide.id);
        const animations = currentSlide.animations || [];
        const inElIds: string[] = [];
        const outElIds: string[] = [];
        animations.forEach((animation) => {
            const inIndex = inElIds.indexOf(animation.elId);
            const outIndex = outElIds.indexOf(animation.elId);
            if (animation.type === "in" && inIndex === -1 && outIndex === -1) {
                inElIds.push(animation.elId);
            } else if (animation.type === "out" && outIndex === -1) {
                outElIds.push(animation.elId);
            }
        });

        this.animationHideElements = inElIds;

        // 处理初始化索引值
        if (animations.length > 0 && animations[0].trigger !== "click") {
            const nextClick = animations.findIndex((animation) => animation.trigger === "click");
            if (nextClick === -1) {
                this.animationIndex = animations.length - 1;
            } else {
                this.animationIndex = nextClick - 1;
            }

            this.setActionAnimationsByIndex(0, this.animationIndex + 1);
        }
    }

    // 根据索引获取动画集合
    setActionAnimationsByIndex(start: number, end: number) {
        this.actionAnimations = [];
        const animations = this.getAnimations();
        const actionAnimations: IPPTAnimation[][] = [];
        animations.slice(start, end).forEach((animation, index) => {
            if (index === 0) {
                actionAnimations.push([animation]);
            } else if (animation.trigger === "meantime") {
                const lastIndex = actionAnimations.length - 1;
                actionAnimations[lastIndex].push(animation);
            } else if (animation.trigger === "after") {
                actionAnimations.push([animation]);
            }
        });

        this.actionAnimations = actionAnimations;
    }

    startVideoRender() {
        this.autoVideoRender = true;
        window.requestAnimationFrame(() => {
            if (this.autoVideoRender) {
                this.resetCheckDrawView();
                this.startVideoRender();
            }
        });
    }

    stopVideoRender() {
        this.autoVideoRender = false;
        this.resetCheckDrawView();
    }

    getAnimations() {
        const currentSlide = this.getCurrentSlide();
        if (!currentSlide) return [];
        return currentSlide.animations || [];
    }

    setAnimations(animations: IPPTAnimation[]) {
        const currentSlide = this.getCurrentSlide();
        if (!currentSlide) return;
        currentSlide.animations = animations;
    }
}
