import { IFontData, ILineData } from "@/plugins/types/font";
import { IPPTTextElement } from "../types/element";
import StageConfig, { TEXT_MARGIN } from "./config";
import { Textarea } from "./textarea";

const COMPENSTATE_LEN = 4;

export class Cursor {
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
        return this._stageConfig.textFocus ? this._stageConfig.operateElement as IPPTTextElement : null;
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

        const left = (element.left + this._left) * this.zoom + x;
        const top = (element.top + this._top) * this.zoom + y;
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

    setCursorPosition(x: number, y: number) {
        const element = this.opreateElement;
        if (!element) return;
        const renderContent = this._stageConfig.getRenderContent(element);

        const { left, textX, top, textY } = this.getCursorPosition(x, y, renderContent);
        this._top = top;
        this._left = left;

        let allDataIndex = 0;
        renderContent.forEach((lineData, index) => {
            if (index < textY) allDataIndex += lineData.texts.length;
        });

        this.setDataPosition(allDataIndex + textX);
    }

    setCursorPositionByData() {
        const { top, left } = this._getLineCursorPositionByData();
        this._left = left;
        this._top = top;
    }

    private _getLineCursorPositionByData() {
        const element = this.opreateElement;
        if (!element) return { top: 0, left: 0 };
        let top = TEXT_MARGIN - COMPENSTATE_LEN / 2 + 1;
        let left = TEXT_MARGIN - element.wordSpace / 2 - 0.5;
        const renderContent = this._stageConfig.getRenderContent(element);

        if (renderContent.length > 0) {
            for (const [lineY, line] of renderContent.entries()) {
                if (this._renderDataPosition[0] === lineY) {
                    break;
                } else {
                    top = top + line.height * element.lineHeight;
                }
            }
            const line = renderContent[this._renderDataPosition[0]];
            let offsetX = 0;

            if (line) {
                for (const [lineX, data] of line.texts.entries()) {
                    if (this._renderDataPosition[1] < lineX) {
                        break;
                    } else {
                        left = left + data.width + element.wordSpace;
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
        let top = TEXT_MARGIN - COMPENSTATE_LEN / 2 + 1;
        let textY = 0;
        const len = renderContent.length;
        for (const [index, line] of renderContent.entries()) {
            if (y < top + line.height * element.lineHeight) {
                break;
            } else {
                if (index + 1 < len) {
                    textY++;
                    top = top + line.height * element.lineHeight;
                }
            }
        }
        return { top, textY };
    }

    private _getTextXCursorPosition(lineData: IFontData[], x: number) {
        const element = this.opreateElement;
        if (!element) return { left: 0, textX: 0 };
        let left = TEXT_MARGIN - element.wordSpace / 2 - 0.5;
        let textX = -1;
        for (const data of lineData) {
            if (x < left + data.width / 2) {
                break;
            } else {
                textX++;
                left = left + data.width + element.wordSpace;
            }
        }
        // 处于最右一位的时候因为回车符减掉1
        if (textX === lineData.length - 1) textX--;
        return { left, textX };
    }

    setCursorHeight(height: number) {
        const element = this.opreateElement;
        if (!element) return;
        this._height = height * element.lineHeight;
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
        if (!element || position < -1 || position >= element.content.length - 1) return;
        this._dataPosition = position;
        this.setRenderDataPosition();
    }

    getDataPosition() {
        return this._dataPosition;
    }

    focus(x: number, y: number) {
        // 暂时默认到最后
        this.setCursorPosition(x, y);
        this.updateCursor();
        this.showCursor();

        this.setInputFocus();
    }

    setInputFocus() {
        setTimeout(() => {
            this._textarea.getTextareaElement().focus();
        }, 200);
    }
}
