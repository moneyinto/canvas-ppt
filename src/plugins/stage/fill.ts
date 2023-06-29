import { IPPTElementFill } from "@/types/element";

export class Fill {
    private _ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx;
    }

    public draw(fill: IPPTElementFill, path: Path2D) {
        this._ctx.save();
        this._ctx.fillStyle = fill.color || "transparent";
        this._ctx.globalAlpha = (100 - (fill.opacity || 0)) / 100;
        this._ctx.fill(path);
        this._ctx.restore();
    }
}
