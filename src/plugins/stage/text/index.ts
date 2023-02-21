import Command from "@/plugins/command";
import { IFontData } from "@/plugins/types/font";
import StageConfig from "../config";
import { Cursor } from "./cursor";
import { Data, TEXT_MARGIN } from "./data";
import { Textarea } from "./Textarea";

export class Text {
    private _stageConfig: StageConfig;
    public cursor: Cursor;
    public data: Data;
    public textarea: Textarea;
    private _ctx: CanvasRenderingContext2D;
    private _textareaHtml: HTMLTextAreaElement;

    // [开始字坐标，开始行坐标，结束字坐标，结束行坐标]
    private _selectArea: [number, number, number, number] | null;
    constructor(container: HTMLDivElement, stageConfig: StageConfig, command: Command, ctx: CanvasRenderingContext2D) {
        this._stageConfig = stageConfig;

        this.textarea = new Textarea(container);
        this.data = new Data(ctx, stageConfig, command);
        this.cursor = new Cursor(container, stageConfig, this.data, this.textarea);

        this._selectArea = null;

        this._ctx = ctx;

        this._textareaHtml = this.textarea.getTextareaElement();

        this._textareaHtml.addEventListener("input", e => this._onInput(e as InputEvent));
        this._textareaHtml.addEventListener("compositionend", e => this._onCompEnd(e as CompositionEvent));
    }

    focus(x: number, y: number) {
        // 暂时默认到最后
        this.cursor.setCursorPosition(x, y);
        this.cursor.updateCursor();
        this.cursor.showCursor();

        // this._updateFontStyleByCursorFont();

        setTimeout(() => {
            this._textareaHtml.focus();
        }, 100);
    }

    private _onInput(e: InputEvent) {
        if (e.inputType === "insertText" && e.data) {
            // 非输入中文
            this._inputText(e.data);
        }
    }

    private _onCompEnd(e: CompositionEvent) {
        if (e.data) {
            const valueArr = e.data.split("");
            valueArr.forEach((value) => {
                this._inputText(value);
            });
        }
    }

    private _inputText(value: string) {
        const config = this.data.config;
        const text: IFontData = {
            value,
            fontSize: config.fontSize,
            fontFamily: config.fontFamily,
            fontWeight: config.fontWeight,
            fontColor: config.fontColor,
            fontStyle: config.fontStyle,
            width: config.fontSize,
            height: config.fontSize,
            underline: !!config.underline,
            strikout: !!config.strikout
        };

        const { width, height } = this.data.getFontSize(text);
        text.width = width;
        text.height = height;

        const currentDataPosition = this.cursor.getDataPosition();

        this.data.addContent(text, currentDataPosition + 1);

        this.cursor.setDataPosition(currentDataPosition + 1);
        this.cursor.setCursorPositionByData();
        this.cursor.updateCursor();

        // ！！！！考虑当光标在最后位置的时候可以不清空canvas直接在对应的位置赋值渲染文本
        // this.renderRichText();

        // 清除textarea中的值
        this._textareaHtml.value = "";
    }

    renderRange({ x, y, width, height }: any) {
        this._ctx.save();
        this._ctx.globalAlpha = 0.6;
        this._ctx.fillStyle = "#AECBFA";
        this._ctx.fillRect(x, y, width, height);
        this._ctx.restore();
    }
}
