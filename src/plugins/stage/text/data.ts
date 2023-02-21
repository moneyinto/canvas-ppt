import Command from "@/plugins/command";
import { baseFontConfig } from "@/plugins/config/font";
import { IPPTTextElement } from "@/plugins/types/element";
import { IFontConfig, IFontData, ILineData } from "@/plugins/types/font";
import { deepClone } from "@/utils";
import StageConfig from "../config";

export const TEXT_MARGIN = 5;

export class Data {
    private _content: IFontData[];
    private _elementWidth: number;
    private _element: IPPTTextElement | null;
    private _wordSpace: number;
    private _lineHeight: number;
    private _elementLeft: number;
    private _elementTop: number;
    private _renderContent: ILineData[];
    private _ctx: CanvasRenderingContext2D;
    private _stageConfig: StageConfig;
    private _command: Command;
    constructor(ctx: CanvasRenderingContext2D, stageConfig: StageConfig, command: Command) {
        this._ctx = ctx;
        this._stageConfig = stageConfig;
        this._command = command;
        this._renderContent = [];

        this._content = [];
        this._element = null;
        this._elementWidth = 0;
        this._wordSpace = 1;
        this._lineHeight = 2;
        this._elementLeft = 0;
        this._elementTop = 0;
    }

    get config() {
        return this._stageConfig.fontConfig;
    }

    get element() {
        return this._element;
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
        this._element = element;
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

    getStashRenderContent() {
        return this._renderContent;
    }

    getLength() {
        return this._content.length;
    }

    addContent(text: IFontData, position: number) {
        this._content.splice(position, 0, text);

        if (this.element) {
            const element = {
                ...this.element,
                content: this._content
            };
            const renderContent = this._stageConfig.getRenderContent(element);
            let height = TEXT_MARGIN * 2;
            renderContent.forEach(line => {
                height += line.height * element.lineHeight;
            });
            element.height = height;
            this._command.executeUpdateRender(element, true);
        }
    }

    deleteContent(position: number) {
        if (position >= this._content.length || position === -1) return false;
        this._content.splice(position, 1);
        return true;
    }

    getFontSize(text: IFontData) {
        this._ctx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
        const metrics = this._ctx.measureText(text.value);
        const width = metrics.width;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        return { width, height };
    }
}
