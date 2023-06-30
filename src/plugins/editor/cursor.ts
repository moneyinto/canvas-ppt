import { IFontData, ILineData } from "@/types/font";
import { IPPTShapeElement, IPPTTableCell, IPPTTableElement, IPPTTextElement } from "@/types/element";
import StageConfig, { TEXT_MARGIN } from "../stage/config";
import Textarea from "./textarea";

const COMPENSTATE_LEN = 4;

export default class Cursor {
    private _container: HTMLDivElement;
    private _textarea: Textarea;
    private _cursor: HTMLDivElement | null;

    private _stageConfig: StageConfig;

    // 坐标位置
    private _height: number;
    private _top: number;
    private _left: number;

    // 渲染数据索引位置
    private _renderDataPosition: [number, number];

    // 原数据索引位置 -1 为最前面 之后值为数据索引值 及光标在该索引数据后面
    private _dataPosition: number;
    constructor(container: HTMLDivElement, textarea: Textarea, stageConfig: StageConfig) {
        this._container = container;
        this._textarea = textarea;
        this._stageConfig = stageConfig;

        this._cursor = null;

        this._height = 0;
        this._top = 0;
        this._left = 0;

        this._dataPosition = -1;
        this._renderDataPosition = [-1, 0];

        this._createCursor();
    }

    get opreateElement() {
        return this._stageConfig.textFocus ? this._stageConfig.operateElements.find(opreateElement => opreateElement.id === this._stageConfig.textFocusElementId) as (IPPTTextElement | IPPTShapeElement | IPPTTableElement) : null;
    }

    get config() {
        return this._stageConfig.fontConfig;
    }

    get zoom() {
        return this._stageConfig.zoom;
    }

    private _createCursor() {
        const cursor = document.createElement("div");
        cursor.style.width = "1px";
        cursor.style.position = "absolute";
        cursor.style.background = "black";
        cursor.style.display = "none";
        cursor.style.userSelect = "none";
        cursor.style.zIndex = "1";
        cursor.classList.add("editor-cursor");

        this._cursor = cursor;
        this._container.append(cursor);
    }

    hideCursor() {
        this._cursor!.style.display = "none";
    }

    showCursor() {
        this._cursor!.style.display = "block";
    }

    updateCursor() {
        const element = this.opreateElement;
        if (!this._cursor || !element) return;
        const { x, y } = this._stageConfig.getStageArea();
        const renderContent = this._stageConfig.getRenderContent(element);
        this.setCursorHeight(this.config.fontSize);
        renderContent.forEach((line, index) => {
            if (index === this._renderDataPosition[0] || (index === 0 && this._renderDataPosition[0] === -1)) {
                this.setCursorHeight(line.height);
            }
        });

        let left = (element.left + this._left) * this.zoom + x;
        let top = (element.top + this._top) * this.zoom + y;

        if (element.type === "table" && this._stageConfig.tableSelectCells && this._stageConfig.tableSelectCells.length > 0) {
            const row = this._stageConfig.tableSelectCells[0][0];
            const col = this._stageConfig.tableSelectCells[0][1];
            const { tableCellLeft, tableCellTop } = this._stageConfig.getTableCellData(element, row, col);
            left += tableCellLeft * this.zoom;
            top += tableCellTop * this.zoom;
        }

        const height = this._height * this.zoom;
        this._cursor.style.left = `${left}px`;
        this._cursor.style.top = `${top}px`;
        this._cursor.style.height = `${height}px`;

        // 更新textarea到光标位置
        this._textarea.setTextareaPosition(left, top + height / 2);
    }

    getCursorPosition(x: number, y: number, renderContent: ILineData[]) {
        const element = this.opreateElement;
        if (!element) return { left: 0, textX: 0, top: 0, textY: 0 };
        // 先计算属于哪一行
        const { top, textY } = this._getTextYCursorPosition(renderContent, y);

        // 计算在某行的位置
        const line = renderContent.length > 0 ? renderContent[textY] : { texts: [], width: 0, height: 0 } as ILineData;
        const lineData = line.texts;
        const offsetX = this._stageConfig.getAlignOffsetX(line, element);
        const { left, textX } = this._getTextXCursorPosition(lineData, x - offsetX);

        this._renderDataPosition = [textY, textX];
        return { left: left + offsetX, textX, top, textY };
    }

    setCursorPosition(x: number, y: number, offsetY: number) {
        const element = this.opreateElement;
        if (!element) return;
        const renderContent = this._stageConfig.getRenderContent(element);
        // y值大于于偏移值的时候，进行y值的偏移，否则为第一行，y为固定值
        if (y < offsetY) {
            y = 4;
        } else {
            y -= offsetY;
        }
        const { left, textX, top, textY } = this.getCursorPosition(x, y, renderContent);
        this._top = top + offsetY;
        this._left = left;

        let allDataIndex = 0;
        renderContent.forEach((lineData, index) => {
            if (index < textY) allDataIndex += lineData.texts.length;
        });

        this.setDataPosition(allDataIndex + textX);
    }

    setCursorPositionByData() {
        const element = this.opreateElement;
        if (!element) return;
        const { top, left } = this._getLineCursorPositionByData();
        let offsetY = 0;
        if (element.type === "shape" || element.type === "table") {
            let rectHeight = element.height;
            if (element.type === "table" && this._stageConfig.tableSelectCells && this._stageConfig.tableSelectCells.length > 0) {
                const row = this._stageConfig.tableSelectCells[0][0];
                const col = this._stageConfig.tableSelectCells[0][1];
                const { tableCellHeight } = this._stageConfig.getTableCellData(element, row, col);
                rectHeight = tableCellHeight;
            }
            const height = this._stageConfig.getTextHeight(element);
            offsetY = (rectHeight - height) / 2;
        }
        this._left = left;
        this._top = top + offsetY;
    }

    private _getLineCursorPositionByData() {
        const element = this.opreateElement;
        if (!element) return { top: 0, left: 0 };
        let textElement: IPPTTextElement | IPPTShapeElement | IPPTTableCell | null = null;
        if (element.type === "table" && this._stageConfig.tableSelectCells && this._stageConfig.tableSelectCells.length > 0) {
            const row = this._stageConfig.tableSelectCells[0][0];
            const col = this._stageConfig.tableSelectCells[0][1];
            textElement = element.data[row][col];
        } else {
            textElement = element as IPPTTextElement | IPPTShapeElement;
        }
        let top = TEXT_MARGIN - COMPENSTATE_LEN / 2 + 1;
        let left = TEXT_MARGIN - textElement.wordSpace / 2 - 0.5;
        const renderContent = this._stageConfig.getRenderContent(element);

        if (renderContent.length > 0) {
            for (const [lineY, line] of renderContent.entries()) {
                if (this._renderDataPosition[0] === lineY) {
                    break;
                } else {
                    top = top + line.height * textElement.lineHeight;
                }
            }
            const line = renderContent[this._renderDataPosition[0]];
            let offsetX = 0;

            if (line) {
                for (const [lineX, data] of line.texts.entries()) {
                    if (this._renderDataPosition[1] < lineX) {
                        break;
                    } else {
                        left = left + data.width + textElement.wordSpace;
                    }
                }

                offsetX = this._stageConfig.getAlignOffsetX(line, element);
            }

            left = left + offsetX;
        }

        return { top, left };
    }

    private _getTextYCursorPosition(renderContent: ILineData[], y: number) {
        const element = this.opreateElement;
        if (!element) return { top: 0, textY: 0 };
        let textElement: IPPTTextElement | IPPTShapeElement | IPPTTableCell | null = null;
        if (element.type === "table" && this._stageConfig.tableSelectCells && this._stageConfig.tableSelectCells.length > 0) {
            const row = this._stageConfig.tableSelectCells[0][0];
            const col = this._stageConfig.tableSelectCells[0][1];
            textElement = element.data[row][col];
        } else {
            textElement = element as IPPTTextElement | IPPTShapeElement;
        }
        let top = TEXT_MARGIN - COMPENSTATE_LEN / 2 + 1;
        let textY = 0;
        const len = renderContent.length;
        for (const [index, line] of renderContent.entries()) {
            if (y < top + line.height * textElement.lineHeight) {
                break;
            } else {
                if (index + 1 < len) {
                    textY++;
                    top = top + line.height * textElement.lineHeight;
                }
            }
        }
        return { top, textY };
    }

    private _getTextXCursorPosition(lineData: IFontData[], x: number) {
        const element = this.opreateElement;
        if (!element) return { left: 0, textX: 0 };
        let textElement: IPPTTextElement | IPPTShapeElement | IPPTTableCell | null = null;
        if (element.type === "table" && this._stageConfig.tableSelectCells && this._stageConfig.tableSelectCells.length > 0) {
            const row = this._stageConfig.tableSelectCells[0][0];
            const col = this._stageConfig.tableSelectCells[0][1];
            textElement = element.data[row][col];
        } else {
            textElement = element as IPPTTextElement | IPPTShapeElement;
        }
        let left = TEXT_MARGIN - textElement.wordSpace / 2 - 0.5;
        let textX = -1;
        for (const data of lineData) {
            if (x < left + data.width / 2) {
                break;
            } else {
                textX++;
                left = left + data.width + textElement.wordSpace;
            }
        }
        // 处于最右一位的时候因为回车符减掉1
        if (textX === lineData.length - 1) textX--;
        return { left, textX };
    }

    setCursorHeight(height: number) {
        const element = this.opreateElement;
        if (!element) return;

        if (element.type === "table") {
            if (this._stageConfig.tableSelectCells && this._stageConfig.tableSelectCells.length > 0) {
                const row = this._stageConfig.tableSelectCells[0][0];
                const col = this._stageConfig.tableSelectCells[0][1];
                const tableCell = element.data[row][col];
                this._height = height * tableCell.lineHeight;
            }
        } else {
            this._height = height * element.lineHeight;
        }
    }

    setRenderDataPosition() {
        const element = this.opreateElement;
        if (!element) return;
        if (this._dataPosition === -1) {
            this._renderDataPosition = [0, -1];
        } else {
            const renderContent = this._stageConfig.getRenderContent(element);
            let x = 0;
            for (const [line, lineData] of renderContent.entries()) {
                // 减一是去掉回车符 当行元素只有一个的时候为只有回车符
                if (this._dataPosition < x + lineData.texts.length - 1) {
                    this._renderDataPosition = [line, this._dataPosition - x];
                    break;
                } else {
                    x = x + lineData.texts.length;
                }
            }
        }
    }

    getRenderDataPosition() {
        return this._renderDataPosition;
    }

    setDataPosition(position: number) {
        const element = this.opreateElement;
        if (!element || position < -1) return;
        if (element.type === "table") {
            if (this._stageConfig.tableSelectCells && this._stageConfig.tableSelectCells.length > 0) {
                const row = this._stageConfig.tableSelectCells[0][0];
                const col = this._stageConfig.tableSelectCells[0][1];
                const tableCell = element.data[row][col];
                if (position >= tableCell.content.length - 1) return;
            }
        }
        if (element.type !== "table" && position >= element.content.length - 1) return;
        this._dataPosition = position;
        this.setRenderDataPosition();
    }

    getDataPosition() {
        return this._dataPosition;
    }

    focus(x: number, y: number, offsetY: number) {
        // 暂时默认到最后
        this.setCursorPosition(x, y, offsetY);
        this.updateCursor();
        this.showCursor();

        this.setInputFocus();
    }

    setInputFocus() {
        setTimeout(() => {
            this._textarea.getTextareaElement().focus();
        }, 200);
    }

    getTextareaText() {
        return this._textarea.getTextareaElement().value;
    }
}
