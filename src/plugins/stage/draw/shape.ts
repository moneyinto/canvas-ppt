import { getShapePath } from "@/utils/shape";
import { IPPTShapeElement } from "@/plugins/types/element";
import StageConfig from "../config";
import { OutLine } from "./outline";
import { Shadow } from "./shadow";

export class Shape {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _outline: OutLine;
    private _shadow: Shadow;
    constructor(stageConfig: StageConfig, ctx: CanvasRenderingContext2D) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._outline = new OutLine(this._ctx);
        this._shadow = new Shadow(this._ctx);
    }

    public draw(element: IPPTShapeElement) {
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
        // 水平垂直翻转
        this._ctx.scale(element.flipH || 1, element.flipV || 1);

        const path = getShapePath(element.shape, element.width, element.height);

        if (element.shadow) {
            this._shadow.draw(element.shadow, zoom);
        }

        this._ctx.globalAlpha = (100 - (element.opacity || 0)) / 100;
        this._ctx.fillStyle = element.fill || "transparent";
        this._ctx.fill(path);

        if (element.outline) {
            this._outline.draw(element.outline, path);
        }

        this._ctx.restore();
    }
}
