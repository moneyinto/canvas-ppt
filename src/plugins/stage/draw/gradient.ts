import { IGradientColor, IRect } from "@/types";

export default class Gradient {
    private _ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx;
    }

    async draw(rect: IRect, gradientColor?: IGradientColor[], gradientType: "linear" | "radial" = "linear", gradientRotate?: number) {
        this._ctx.save();
        const { x, y, width, height } = rect;
        this._ctx.translate(x, y);
        const linear: [number, number, number, number] = [width / 2, 0, width / 2, height];
        const radial: [number, number, number, number, number, number] = [width / 2, height / 2, 0, width / 2, height / 2, width / 2];
        const rotate = gradientRotate || 0;
        if (rotate > 0 && gradientType === "linear") {
            const angle = Math.atan(9 / 16);
            const currentAngle = Math.PI / 180 * rotate;
            if (angle >= currentAngle) {
                const offsetX = Math.tan(rotate / 180 * Math.PI) * height / 2;
                linear[0] = linear[0] + offsetX;
                linear[2] = linear[2] - offsetX;
            } else if (angle < currentAngle && currentAngle <= Math.PI / 2 - angle) {
                const offsetY = Math.tan(Math.PI / 2 - currentAngle) * width / 2;
                linear[0] = width;
                linear[1] = height / 2 - offsetY;
                linear[2] = 0;
                linear[3] = height / 2 + offsetY;
            } else if (currentAngle > Math.PI / 2 && currentAngle <= Math.PI - angle) {
                const offsetY = Math.tan(currentAngle - Math.PI / 2) * width / 2;
                linear[0] = width;
                linear[1] = height / 2 + offsetY;
                linear[2] = 0;
                linear[3] = height / 2 - offsetY;
            } else if (currentAngle <= Math.PI && currentAngle > Math.PI - angle) {
                const offsetX = Math.tan(Math.PI - currentAngle) * height / 2;
                linear[0] = width / 2 + offsetX;
                linear[1] = height;
                linear[2] = width / 2 - offsetX;
                linear[3] = 0;
            } else if (currentAngle > Math.PI && currentAngle <= Math.PI + angle) {
                const offsetX = Math.tan(currentAngle - Math.PI) * height / 2;
                linear[0] = width / 2 - offsetX;
                linear[1] = height;
                linear[2] = width / 2 + offsetX;
                linear[3] = 0;
            } else if (currentAngle > Math.PI + angle && currentAngle <= Math.PI * 3 / 2) {
                const offsetY = Math.tan(Math.PI * 3 / 2 - currentAngle) * width / 2;
                linear[0] = 0;
                linear[1] = height / 2 + offsetY;
                linear[2] = width;
                linear[3] = height / 2 - offsetY;
            } else if (currentAngle > Math.PI * 3 / 2 && currentAngle <= Math.PI * 2 - angle) {
                const offsetY = Math.tan(currentAngle - Math.PI * 3 / 2) * width / 2;
                linear[0] = 0;
                linear[1] = height / 2 - offsetY;
                linear[2] = width;
                linear[3] = height / 2 + offsetY;
            } else {
                const offsetX = Math.tan(Math.PI * 2 - currentAngle) * height / 2;
                linear[0] = width / 2 - offsetX;
                linear[1] = 0;
                linear[2] = width / 2 + offsetX;
                linear[3] = height;
            }
        }

        const gra = gradientType === "radial" ? this._ctx.createRadialGradient(...radial) : this._ctx.createLinearGradient(...linear);

        for (const color of gradientColor || []) {
            gra.addColorStop(color.offset, color.value);
        }

        this._ctx.fillStyle = gra;
        this._ctx.fillRect(0, 0, width, height);
        this._ctx.restore();
    }
}
