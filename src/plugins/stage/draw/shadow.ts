import { IPPTElementShadow } from "@/plugins/types/element";

export class Shadow {
    private _ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx;
    }

    public draw(shadow: IPPTElementShadow) {
        if (shadow) {
            this._ctx.shadowOffsetX = shadow.h;
            this._ctx.shadowOffsetY = shadow.v;
            this._ctx.shadowBlur = shadow.blur;
            this._ctx.shadowColor = shadow.color;
        }
    }
}
