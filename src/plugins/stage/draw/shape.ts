import { getShapePath } from "@/utils/shape";
import { IPPTShapeElement } from "@/types/element";
import StageConfig from "../config";
import { OutLine } from "./outline";
import { Shadow } from "./shadow";
import { Fill } from "./fill";
import Gradient from "./gradient";

export class Shape {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _outline: OutLine;
    private _shadow: Shadow;
    private _fill: Fill;
    private _gradient: Gradient;
    constructor(stageConfig: StageConfig, ctx: CanvasRenderingContext2D) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._outline = new OutLine(this._ctx);
        this._shadow = new Shadow(this._ctx);
        this._fill = new Fill(this._ctx);
        this._gradient = new Gradient(this._ctx);
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

        const path = getShapePath(element.shape, element.width, element.height) as Path2D;

        if (element.shadow) {
            this._shadow.draw(element.shadow, zoom);
        }

        if (element.fill) {
            this._fill.draw(element.fill, path);
        }

        if (element.outline) {
            this._outline.draw(element.outline, path);
        }

        if (element.gradient) {
            const { color, type, rotate } = element.gradient;
            console.log(color);
            this._gradient.draw({ x: -element.width / 2, y: -element.height / 2, width: element.width, height: element.height }, color, type, rotate);
        }

        this._ctx.restore();
    }
}
