import { IPPTElementOutline } from "@/plugins/types/element";

export class OutLine {
    private _ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx;
    }

    public draw(outline: IPPTElementOutline, path: Path2D) {
        if (outline) {
            this._ctx.save();
            this._ctx.globalAlpha = (100 - (outline.opacity || 0)) / 100;
            const lineWidth = outline.width || 2;
            this._ctx.lineWidth = lineWidth;
            this._ctx.strokeStyle = outline.color || "#000";
            if (outline.style === "dashed") {
                this._ctx.setLineDash([
                    (8 * lineWidth) / 2,
                    (4 * lineWidth) / 2
                ]);
            }
            this._ctx.stroke(path);
            this._ctx.restore();
        }
    }
}
