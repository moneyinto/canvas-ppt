import { baseFontConfig } from "@/plugins/config/font";
import { IPPTTextElement } from "@/plugins/types/element";
import { IFontConfig, IFontData, ILineData } from "@/plugins/types/font";
import { deepClone } from "@/utils";
import StageConfig from "../config";

export const TEXT_MARGIN = 5;

export class Data {
    private _content: IFontData[];
    private _elementWidth: number;
    private _wordSpace: number;
    private _lineHeight: number;
    private _elementLeft: number;
    private _elementTop: number;
    private _renderContent: ILineData[];
    private _ctx: CanvasRenderingContext2D;
    private _stageConfig: StageConfig;
    constructor(ctx: CanvasRenderingContext2D, stageConfig: StageConfig) {
        this._ctx = ctx;
        this._stageConfig = stageConfig;
        this._renderContent = [];

        this._content = [];
        this._elementWidth = 0;
        this._wordSpace = 1;
        this._lineHeight = 2;
        this._elementLeft = 0;
        this._elementTop = 0;
    }

    get config() {
        return this._stageConfig.fontConfig;
    }

    get lineHeight() {
        return this._lineHeight;
    }

    get wordSpace() {
        return this._wordSpace;
    }

    get elementLeft() {
        return this._elementLeft;
    }

    get elementTop() {
        return this._elementTop;
    }

    get zoom() {
        return this._stageConfig.zoom;
    }

    resetConfig() {
        this._stageConfig.setFontConfig(deepClone(baseFontConfig));
    }

    updateConfig(props: Partial<IFontConfig>) {
        this._stageConfig.setFontConfig({
            ...this.config,
            ...props
        });
    }

    setElement(element: IPPTTextElement | null) {
        if (element) {
            this._content = element.content;
            this._elementWidth = element.width;
            this._wordSpace = element.wordSpace;
            this._lineHeight = element.lineHeight;
            this._elementLeft = element.left;
            this._elementTop = element.top;
        } else {
            this._content = [];
            this._elementWidth = 0;
            this._wordSpace = 1;
            this._lineHeight = 2;
            this._elementLeft = 0;
            this._elementTop = 0;
        }
    }

    getContent() {
        return this._content;
    }

    getRenderContent() {
        const width = this._elementWidth - TEXT_MARGIN * 2;
        const renderContent: ILineData[] = [];
        let lineData: ILineData = {
            height: 0,
            width: 0,
            texts: []
        };
        let countWidth = 0;
        this._content.forEach((text) => {
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
                countWidth = countWidth + text.width + this._wordSpace;
                lineData.width = countWidth;
            } else {
                renderContent.push(lineData);
                lineData = {
                    height: 0,
                    width: 0,
                    texts: [text]
                };
                countWidth = text.width + this._wordSpace;
            }
        });

        // if (lineData.texts.length > 0) renderContent.push(lineData);

        this._renderContent = renderContent;
        return renderContent;
    }

    getRenderSelect(
        x: number,
        y: number,
        lineData: ILineData,
        index: number,
        selectArea: [number, number, number, number]
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
                        return acr + cur + this._wordSpace;
                    });
            }

            const width = lineData.texts
                .slice(startX, endX)
                .map((text) => text.width)
                .reduce((acr, cur) => {
                    return acr + cur + this._wordSpace;
                });

            const offsetX = this.getAlignOffsetX(lineData);
            return {
                x: x + offsetX,
                y,
                width: width + this._wordSpace,
                height: lineData.height * this._lineHeight
            };
        }
        return undefined;
    }

    getAlignOffsetX(line: ILineData) {
        const align = this.config.align;
        return {
            left: 0,
            center: (this._elementWidth - TEXT_MARGIN * 2 - line.width) / 2,
            right: this._elementWidth - TEXT_MARGIN * 2 - line.width
        }[align];
    }

    getStashRenderContent() {
        return this._renderContent;
    }

    getLength() {
        return this._content.length;
    }

    addContent(text: IFontData, position: number) {
        this._content.splice(position, 0, text);
    }

    deleteContent(position: number) {
        if (position >= this._content.length || position === -1) return false;
        this._content.splice(position, 1);
        return true;
    }

    getSelectArea(selectArea: [number, number, number, number]) {
        const renderContent = this.getRenderContent();
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

    getFontSize(text: IFontData) {
        this._ctx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
        const metrics = this._ctx.measureText(text.value);
        const width = metrics.width;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        return { width, height };
    }
}
