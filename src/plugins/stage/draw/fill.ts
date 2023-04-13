import { SHAPE_TYPE } from "@/plugins/config/shapes";
import { getShapePath } from "@/utils/shape";

export class Fill {
    private _ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx;
    }

    public draw(fill: string, fillOpacity: number, width: number, height: number) {
        this._ctx.save();
        this._ctx.fillStyle = fill;
        this._ctx.globalAlpha = (100 - fillOpacity) / 100;
        const path = getShapePath(SHAPE_TYPE.RECT, width, height);
        this._ctx.fill(path);
        this._ctx.restore();
    }
}
