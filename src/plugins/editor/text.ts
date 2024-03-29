import Command from "./command";
import { IFontData } from "@/types/font";
import StageConfig from "../stage/config";
import Cursor from "./cursor";
import Textarea from "./textarea";

export default class Text {
    private _stageConfig: StageConfig;

    private _textarea: HTMLTextAreaElement;
    private _cursor: Cursor;
    private _command: Command;

    private _ctx: CanvasRenderingContext2D;

    constructor(
        ctx: CanvasRenderingContext2D,
        stageConfig: StageConfig,
        command: Command,
        textarea: Textarea,
        cursor: Cursor
    ) {
        this._stageConfig = stageConfig;
        this._cursor = cursor;
        this._command = command;

        this._textarea = textarea.getTextareaElement();

        this._ctx = ctx;

        this._textarea.addEventListener("input", (e) => {
            this._onInput(e as InputEvent);
        });
        this._textarea.addEventListener("compositionend", (e) => {
            this._onCompEnd(e as CompositionEvent);
        });
    }

    getFontSize(text: IFontData) {
        if (text.value === "\n") return { width: 0, height: 0 };
        this._ctx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
        const metrics = this._ctx.measureText(text.value);
        const width = metrics.width;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        return { width, height };
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
        const config = this._stageConfig.fontConfig;
        const text: IFontData = {
            value,
            fontSize: config.fontSize,
            fontFamily: config.fontFamily,
            fontWeight: config.fontWeight,
            fontColor: config.fontColor,
            fontStyle: config.fontStyle,
            width: config.fontSize,
            height: config.fontSize,
            underline: config.underline,
            strikout: config.strikout
        };

        const { width, height } = this.getFontSize(text);
        text.width = width;
        text.height = height;

        const currentDataPosition = this._cursor.getDataPosition();

        this._command.executeAddText(text, currentDataPosition + 1);
        this._cursor.setDataPosition(currentDataPosition + 1);
        this._cursor.setCursorPositionByData();
        this._cursor.updateCursor();

        // 清除textarea中的值
        this._textarea.value = "";
    }
}
