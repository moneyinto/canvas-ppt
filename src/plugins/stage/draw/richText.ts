import { SHAPE_TYPE } from "@/plugins/config/shapes";
import { IPPTShapeElement, IPPTTextElement } from "@/types/element";
import { IFontData } from "@/types/font";
import { getShapePath } from "@/utils/shape";
import StageConfig, { TEXT_MARGIN } from "../config";
import { OutLine } from "./outline";
import { Shadow } from "./shadow";
import { Fill } from "./fill";

export class RichText {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _outline: OutLine;
    private _shadow: Shadow;
    private _fill: Fill;
    constructor(stageConfig: StageConfig, ctx: CanvasRenderingContext2D) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._outline = new OutLine(this._ctx);
        this._shadow = new Shadow(this._ctx);
        this._fill = new Fill(this._ctx);
    }

    private _drawStrikout(text: IFontData, x: number, y: number, fontHeight: number, lineHeight: number, wordSpace: number) {
        const offsetY = fontHeight + fontHeight * (lineHeight - 1) / 2;
        const compensateY = (fontHeight - text.fontSize) * 0.1; // 英文，大小字体存在时，存在错位感，对小字号进行一些值的补偿
        const underLineY = y + offsetY + 2 - text.fontSize / 2 - compensateY; // 补两个像素
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.lineWidth = text.fontSize / 10;
        this._ctx.strokeStyle = text.fontColor;
        const compensate = Math.abs(Math.sign(this._ctx.lineWidth - 2) * 0.2); // 字体大和小，中划线有明显的断开或交叉，进行0.2的补偿错位
        this._ctx.moveTo(x - wordSpace / 2 - compensate, underLineY);
        this._ctx.lineTo(x + text.width + wordSpace / 2 + compensate, underLineY);
        this._ctx.stroke();
        this._ctx.restore();
    }

    private _drawUnderLine(text: IFontData, x: number, y: number, fontHeight: number, lineHeight: number, wordSpace: number) {
        const offsetY = fontHeight + fontHeight * (lineHeight - 1) / 2;
        const underLineY = y + offsetY + 2; // 补两个像素
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.lineWidth = Math.ceil(fontHeight / 20);
        this._ctx.strokeStyle = text.fontColor;
        const compensate = Math.abs(Math.sign(this._ctx.lineWidth - 2) * 0.2); // 字体大和小，下划线有明显的断开或交叉，进行0.2的补偿错位
        this._ctx.moveTo(x - wordSpace / 2 - compensate, underLineY);
        this._ctx.lineTo(x + text.width + wordSpace / 2 + compensate, underLineY);
        this._ctx.stroke();
        this._ctx.restore();
    }

    private _fillText(text: IFontData, x: number, y: number, fontHeight: number, lineHeight: number) {
        this._ctx.save();
        this._ctx.textBaseline = "bottom";
        this._ctx.fillStyle = text.fontColor;
        this._ctx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
        const compensate = (fontHeight - text.fontSize) * 0.1; // 英文，大小字体存在时，存在错位感，对小字号进行一些值的补偿
        const offsetY = fontHeight + fontHeight * (lineHeight - 1) / 2 - compensate;
        this._ctx.fillText(text.value, x, y + offsetY, text.fontSize);
        this._ctx.restore();
    }

    public renderContent(element: IPPTTextElement | IPPTShapeElement) {
        // 绘制text
        const lineTexts = this._stageConfig.getRenderContent(element);
        let textX = TEXT_MARGIN;
        let textY = TEXT_MARGIN;
        lineTexts.forEach(lineData => {
            const lineHeight = lineData.height * element.lineHeight;
            const offsetX = this._stageConfig.getAlignOffsetX(lineData, element);
            lineData.texts.forEach(text => {
                // 排除换行情况
                if (text.value !== "\n") {
                    if (text.underline) {
                        this._drawUnderLine(text, textX + offsetX, textY, lineData.height, element.lineHeight, element.wordSpace);
                    }

                    if (text.strikout) {
                        this._drawStrikout(text, textX + offsetX, textY, lineData.height, element.lineHeight, element.wordSpace);
                    }

                    this._fillText(text, textX + offsetX, textY, lineData.height, element.lineHeight);
                    textX = textX + text.width + element.wordSpace;
                }
            });
            textX = TEXT_MARGIN;
            textY = textY + lineHeight;
        });
    }

    public draw(element: IPPTTextElement) {
        const zoom = this._stageConfig.zoom;
        const { x, y } = this._stageConfig.getStageOrigin();

        this._ctx.save();

        // 缩放画布
        this._ctx.scale(zoom, zoom);

        const ox = x + element.left + element.width / 2;
        const oy = y + element.top + element.height / 2;

        // 平移坐标原点
        this._ctx.translate(ox, oy);

        // 旋转画布
        this._ctx.rotate((element.rotate / 180) * Math.PI);

        const path = getShapePath(SHAPE_TYPE.RECT, element.width, element.height) as Path2D;
        if (element.fill) {
            this._fill.draw(element.fill, path);
        }

        if (element.outline) {
            this._outline.draw(element.outline, path);
        }

        if (element.shadow) {
            this._shadow.draw(element.shadow, zoom);
        }

        // 平移到矩形左上角点位
        this._ctx.translate(-element.width / 2, -element.height / 2);

        this.renderContent(element);

        this._ctx.restore();
    }
}
