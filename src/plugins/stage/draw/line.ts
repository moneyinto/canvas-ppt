import { IPPTLineElement } from "@/types/element";
import StageConfig from "../config";

export class Line {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    constructor(stageConfig: StageConfig, ctx: CanvasRenderingContext2D) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
    }

    public draw(element: IPPTLineElement) {
        const zoom = this._stageConfig.zoom;
        const { x, y } = this._stageConfig.getStageOrigin();

        this._ctx.save();

        // 缩放画布
        this._ctx.scale(zoom, zoom);

        this._ctx.translate(x + element.left, y + element.top);

        this._ctx.strokeStyle = element.color;
        this._ctx.lineWidth = element.borderWidth;
        if (element.style === "dashedPoint") {
            // 点线间隔
        } else if (element.style === "dashed") {
            this._ctx.setLineDash([8, 4]);
        }

        this._ctx.beginPath();
        this._ctx.moveTo(...element.start);
        this._ctx.lineTo(...element.end);

        this._ctx.stroke();

        if (element.endStyle === "arrow") {
            const { point1, point2, point3 } = this._getLineEndArrow(element);
            this._ctx.beginPath();
            this._ctx.moveTo(...element.end);
            this._ctx.lineTo(point1[0], point1[1]);
            this._ctx.lineTo(point3[0], point3[1]);
            this._ctx.lineTo(point2[0], point2[1]);
            this._ctx.closePath();
            this._ctx.fillStyle = element.color;
            this._ctx.stroke();
            this._ctx.fill();
        }

        if (element.endStyle === "dot") {
            this._ctx.fillStyle = element.color;
            this._ctx.beginPath();
            this._ctx.arc(element.end[0], element.end[1], element.borderWidth, 0, 2 * Math.PI);
            this._ctx.closePath();
            this._ctx.fill();
        }

        if (element.startStyle === "arrow") {
            const { point1, point2, point3 } = this._getLineStartArrow(element);
            this._ctx.beginPath();
            this._ctx.moveTo(...element.start);
            this._ctx.lineTo(point1[0], point1[1]);
            this._ctx.lineTo(point3[0], point3[1]);
            this._ctx.lineTo(point2[0], point2[1]);
            this._ctx.closePath();
            this._ctx.fillStyle = element.color;
            this._ctx.stroke();
            this._ctx.fill();
        }

        if (element.startStyle === "dot") {
            this._ctx.fillStyle = element.color;
            this._ctx.beginPath();
            this._ctx.arc(element.start[0], element.start[1], element.borderWidth, 0, 2 * Math.PI);
            this._ctx.closePath();
            this._ctx.fill();
        }

        this._ctx.restore();
    }

    private _getLineStartArrow(element: IPPTLineElement) {
        const r = 4;
        const 𝜃 = 30 / 180 * Math.PI;
        const rx = element.start[0];
        const ry = element.start[1];
        const lineLen = Math.hypot(element.end[0], element.end[1]);
        const scale = r / lineLen;
        const cx = -element.end[0] * scale;
        const cy = -element.end[1] * scale;
        const point1 = this._stageConfig.rotate(rx, ry, cx, cy, 𝜃);
        const point2 = this._stageConfig.rotate(rx, ry, cx, cy, -𝜃);
        return { point1, point2, point3: [cx, cy] };
    }

    private _getLineEndArrow(element: IPPTLineElement) {
        const r = 4;
        const 𝜃 = 30 / 180 * Math.PI;
        const rx = element.end[0];
        const ry = element.end[1];
        const lineLen = Math.hypot(rx, ry);
        const scale = (lineLen + r) / lineLen;
        const cx = rx * scale;
        const cy = ry * scale;
        const point1 = this._stageConfig.rotate(rx, ry, cx, cy, 𝜃);
        const point2 = this._stageConfig.rotate(rx, ry, cx, cy, -𝜃);
        return { point1, point2, point3: [cx, cy] };
    }
}
