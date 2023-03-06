import { SHAPE_TYPE } from "@/plugins/config/shapes";
import { IPPTShapeElement } from "@/plugins/types/element";
import StageConfig from "../config";
import { OutLine } from "./outline";

export class Shape {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _outline: OutLine;
    constructor(stageConfig: StageConfig, ctx: CanvasRenderingContext2D) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._outline = new OutLine(this._ctx);
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

        this._ctx.fillStyle = element.fill || "transparent";
        this._ctx.globalAlpha = (100 - (element.opacity || 0)) / 100;
        const path = this.getPath(element.shape, element.width, element.height);
        this._ctx.fill(path);

        if (element.outline) {
            this._outline.draw(element.outline, path);
        }

        this._ctx.restore();
    }

    public getPath(type: SHAPE_TYPE, width: number, height: number) {
        const offsetX = -width / 2;
        const offsetY = -height / 2;

        const rect = {
            minX: offsetX,
            minY: offsetY,
            maxX: width / 2,
            maxY: height / 2
        };

        let path = "";

        switch (type) {
            case SHAPE_TYPE.RECT: {
                path = `M${rect.minX} ${rect.minY}h${width}v${height}H${rect.minX}z`;
                break;
            }
            case SHAPE_TYPE.RECT_RADIUS: {
                const radius = Math.min(width, height) * 0.1;
                path = `M ${rect.minX + radius} ${rect.minY} L ${
                    rect.maxX - radius
                } ${rect.minY} Q ${rect.maxX} ${rect.minY} ${rect.maxX} ${
                    rect.minY + radius
                } L ${rect.maxX} ${rect.maxY - radius} Q ${rect.maxX} ${
                    rect.maxY
                } ${rect.maxX - radius} ${rect.maxY} L ${rect.minX + radius} ${
                    rect.maxY
                } Q ${rect.minX} ${rect.maxY} ${rect.minX} ${
                    rect.maxY - radius
                } L ${rect.minX} ${rect.minY + radius} Q ${rect.minX} ${
                    rect.minY
                } ${rect.minX + radius} ${rect.minY} Z`;
                break;
            }
            case SHAPE_TYPE.RECT_MINUS_SINGLE_ANGLE: {
                const len = Math.min(width, height) * 0.4;
                path = `M${rect.maxX} ${rect.minY + len}V${rect.maxY}H${
                    rect.minX
                }V${rect.minY}H${rect.maxX - len}L${rect.maxX} ${
                    rect.minY + len
                }Z`;
                break;
            }
            case SHAPE_TYPE.RECT_MINUS_SAME_SIDE_ANGLE: {
                const len = Math.min(width, height) * 0.2;
                path = `M${rect.maxX} ${rect.minY + len}V${rect.maxY}H${
                    rect.minX
                }V${rect.minY + len}L${rect.minX + len} ${rect.minY}H${
                    rect.maxX - len
                }L${rect.maxX} ${rect.minY + len}Z`;
                break;
            }
            case SHAPE_TYPE.RECT_MINUS_OPPOSITE_ANGLE: {
                const len = Math.min(width, height) * 0.2;
                path = `M${rect.maxX} ${rect.minY + len}V${rect.maxY}H${
                    rect.minX + len
                }L${rect.minX} ${rect.maxY - len}V${rect.minY}H${
                    rect.maxX - len
                }L${rect.maxX} ${rect.minY + len}Z`;
                break;
            }
            case SHAPE_TYPE.RECT_SINGLE_RADIUS_MINUS_SINGLE_ANGLE: {
                const len = Math.min(width, height) * 0.2;
                const radius = Math.min(width, height) * 0.2;
                path = `M${rect.maxX} ${rect.minY + len}V${rect.maxY}H${
                    rect.minX
                }V${rect.minY + radius}Q${rect.minX} ${rect.minY} ${
                    rect.minX + radius
                } ${rect.minY}H${rect.maxX - len}L${rect.maxX} ${
                    rect.minY + len
                }Z`;
                break;
            }
            case SHAPE_TYPE.RECT_SINGLE_RADIUS: {
                const radius = Math.min(width, height) * 0.2;
                path = `M ${rect.minX} ${rect.minY} L ${rect.maxX - radius} ${
                    rect.minY
                } Q ${rect.maxX} ${rect.minY} ${rect.maxX} ${
                    rect.minY + radius
                } L ${rect.maxX} ${rect.maxY} L ${rect.minX} ${rect.maxY} L ${
                    rect.minX
                } ${rect.minY} Z`;
                break;
            }
            case SHAPE_TYPE.RECT_SAME_SIDE_RADIUS: {
                const radius = Math.min(width, height) * 0.2;
                path = `M ${rect.minX + radius} ${rect.minY} L ${
                    rect.maxX - radius
                } ${rect.minY} Q ${rect.maxX} ${rect.minY} ${rect.maxX} ${
                    rect.minY + radius
                } L ${rect.maxX} ${rect.maxY} L ${rect.minX} ${rect.maxY} L ${
                    rect.minX
                } ${rect.minY + radius} Q ${rect.minX} ${rect.minY} ${
                    rect.minX + radius
                } ${rect.minY} Z`;
                break;
            }
            case SHAPE_TYPE.RECT_OPPOSITE_RADIUS: {
                const radius = Math.min(width, height) * 0.2;
                path = `M ${rect.minX + radius} ${rect.minY} L ${
                    rect.maxX - radius
                } ${rect.minY} Q ${rect.maxX} ${rect.minY} ${rect.maxX} ${
                    rect.minY + radius
                } L ${rect.maxX} ${rect.maxY} L ${rect.minX + radius} ${
                    rect.maxY
                } Q ${rect.minX} ${rect.maxY} ${rect.minX} ${
                    rect.maxY - radius
                } L ${rect.minX} ${rect.minY} Z`;
                break;
            }
            case SHAPE_TYPE.OVAL: {
                const rx = width / 2;
                const ry = height / 2;
                const sx = (rect.minX + rect.maxX) / 2;
                const sy = rect.minY;
                const ex = (rect.minX + rect.maxX) / 2;
                const ey = rect.maxY;
                path = `M ${sx} ${sy} A ${rx} ${ry} 0 1 1 ${ex} ${ey} A ${rx} ${ry} 0 1 1 ${sx} ${sy} Z`;
                break;
            }
            case SHAPE_TYPE.TRIANGLE: {
                const sx = (rect.minX + rect.maxX) / 2;
                const sy = rect.minY;
                path = `M ${sx} ${sy} L ${rect.minX} ${rect.maxY} L ${rect.maxX} ${rect.maxY} Z`;
                break;
            }
            case SHAPE_TYPE.RIGHT_TRIANGLE: {
                path = `M ${rect.minX} ${rect.minY} L ${rect.minX} ${rect.maxY} L ${rect.maxX} ${rect.maxY} Z`;
                break;
            }
            case SHAPE_TYPE.PARALLELOGRAM: {
                const offsetX = width / 2 * 0.3;
                path = `M ${rect.minX + offsetX} ${rect.minY} L ${rect.maxX} ${rect.minY} L ${rect.maxX - offsetX} ${rect.maxY} L ${rect.minX} ${rect.maxY} Z`;
                break;
            }
            case SHAPE_TYPE.TRAPEZOIDAL: {
                const offsetX = width / 2 * 0.3;
                path = `M ${rect.minX + offsetX} ${rect.minY} L ${rect.maxX - offsetX} ${rect.minY} L ${rect.maxX} ${rect.maxY} L ${rect.minX} ${rect.maxY} Z`;
                break;
            }
            case SHAPE_TYPE.DIAMOND: {
                const sx = (rect.minX + rect.maxX) / 2;
                const sy = (rect.minY + rect.maxY) / 2;
                path = `M ${sx} ${rect.minY} L ${rect.maxX} ${sy} L ${sx} ${rect.maxY} L ${rect.minX} ${sy} Z`;
                break;
            }
            case SHAPE_TYPE.PENTAGON: {
                const offsetX = width * 0.19;
                const offsetY = height * 0.38;
                const sx = (rect.minX + rect.maxX) / 2;
                path = `M ${sx} ${rect.minY} L ${rect.maxX} ${rect.minY + offsetY} L ${rect.maxX - offsetX} ${rect.maxY} L ${rect.minX + offsetX} ${rect.maxY} L ${rect.minX} ${rect.minY + offsetY} Z`;
                break;
            }
            case SHAPE_TYPE.HEXAGON: {
                const offsetX = width * 0.2;
                const sy = (rect.minY + rect.maxY) / 2;
                path = `M ${rect.minX + offsetX} ${rect.minY} L ${rect.maxX - offsetX} ${rect.minY} L ${rect.maxX} ${sy} L ${rect.maxX - offsetX} ${rect.maxY} L ${rect.minX + offsetX} ${rect.maxY} L ${rect.minX} ${sy} Z`;
                break;
            }
            case SHAPE_TYPE.HEPTAGON: {
                const cx = (rect.minX + rect.maxX) / 2;
                const ax = 0.11 * width;
                const ay = 0.195 * height;
                const by = 0.645 * height;
                const dx = 0.275 * width;
                path = `M ${ax + rect.minX} ${ay + rect.minY} L ${cx} ${rect.minY} L ${rect.maxX - ax} ${ay + rect.minY} L ${rect.maxX} ${by + rect.minY} L ${rect.maxX - dx} ${rect.maxY} L ${rect.minX + dx} ${rect.maxY} L ${rect.minX} ${by + rect.minY} Z`;
                break;
            }
            case SHAPE_TYPE.OCTAGON: {
                const x = 0.295 * width;
                const y = 0.295 * height;
                path = `M ${x + rect.minX} ${rect.minY} L ${rect.maxX - x} ${rect.minY} L ${rect.maxX} ${rect.minY + y} L ${rect.maxX} ${rect.maxX - y} L ${rect.maxX - x} ${rect.maxY} L ${rect.minX + x} ${rect.maxY} L ${rect.minX} ${rect.maxY - y} L ${rect.minX} ${rect.minY + y} Z`;
                break;
            }
            case SHAPE_TYPE.DECAGON: {
                const x = 0.096 * width;
                const y = 0.182 * height;
                const lw = 0.31 * width;
                const tx = ((rect.maxX - rect.minX) - lw) / 2 + rect.minX;
                path = `M ${x + rect.minX} ${y + rect.minY} L ${tx} ${rect.minY} L ${tx + lw} ${rect.minY} L ${rect.maxX - x} ${rect.minY + y} L ${rect.maxX} ${(rect.maxY + rect.minY) / 2} L ${rect.maxX - x} ${rect.maxY - y} L ${tx + lw} ${rect.maxY} L ${tx} ${rect.maxY} L ${rect.minX + x} ${rect.maxY - y} L ${rect.minX} ${(rect.maxY + rect.minY) / 2} Z`;
                break;
            }
            case SHAPE_TYPE.DODECAGON: {
                const x = 0.134 * width;
                const y = 0.134 * height;
                const lw = 0.268 * width;
                const lh = 0.268 * height;
                const tx = ((rect.maxX - rect.minX) - lw) / 2 + rect.minX;
                const ty = ((rect.maxY - rect.minY) - lh) / 2 + rect.minY;
                path = `M ${x + rect.minX} ${y + rect.minY} L ${tx} ${rect.minY} L ${tx + lw} ${rect.minY} L ${rect.maxX - x} ${rect.minY + y} L ${rect.maxX} ${ty} L ${rect.maxX} ${ty + lh} L ${rect.maxX - x} ${rect.maxY - y} L ${tx + lw} ${rect.maxY} L ${tx} ${rect.maxY} L ${rect.minX + x} ${rect.maxY - y} L ${rect.minX} ${ty + lh} L ${rect.minX} ${ty} Z`;
                break;
            }
            case SHAPE_TYPE.PIESHAPE: {
                const cx = (rect.minX + rect.maxX) / 2;
                const cy = (rect.minY + rect.maxY) / 2;
                const rx = width / 2;
                const ry = height / 2;
                path = `M ${cx} ${rect.minY} L ${cx} ${cy} L ${rect.maxX} ${cy} A ${rx} ${ry} 0 0 1 ${cx} ${rect.maxY} A ${rx} ${ry} 0 0 1 ${rect.minX} ${cy} A ${rx} ${ry} 0 0 1 ${cx} ${rect.minY} Z`;
                break;
            }
        }

        return new Path2D(path);
    }
}
