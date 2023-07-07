import { SHAPE_TYPE } from "@/config/shapes";

export const getShapePath = (type: SHAPE_TYPE, width: number, height: number, needPathString?: boolean) => {
    const offsetX = -width / 2;
    const offsetY = -height / 2;

    const rect = {
        minX: needPathString ? 0 : offsetX,
        minY: needPathString ? 0 : offsetY,
        maxX: needPathString ? width : width / 2,
        maxY: needPathString ? height : height / 2
    };

    let path = "";

    switch (type) {
        case SHAPE_TYPE.RECT: {
            path = `M${rect.minX} ${rect.minY}H${rect.maxX}V${rect.maxY}H${rect.minX}Z`;
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
        case SHAPE_TYPE.PIE_SHAPE: {
            const cx = (rect.minX + rect.maxX) / 2;
            const cy = (rect.minY + rect.maxY) / 2;
            const rx = width / 2;
            const ry = height / 2;
            path = `M ${cx} ${rect.minY} L ${cx} ${cy} L ${rect.maxX} ${cy} A ${rx} ${ry} 0 0 1 ${cx} ${rect.maxY} A ${rx} ${ry} 0 0 1 ${rect.minX} ${cy} A ${rx} ${ry} 0 0 1 ${cx} ${rect.minY} Z`;
            break;
        }
        case SHAPE_TYPE.CHORD_SHAPE: {
            const cx = (rect.minX + rect.maxX) / 2;
            const cy = (rect.minY + rect.maxY) / 2;
            const rx = width / 2;
            const ry = height / 2;
            path = `M ${cx} ${rect.minY} L ${rect.maxX} ${cy} A ${rx} ${ry} 0 0 1 ${cx} ${rect.maxY} A ${rx} ${ry} 0 0 1 ${rect.minX} ${cy} A ${rx} ${ry} 0 0 1 ${cx} ${rect.minY} Z`;
            break;
        }
        case SHAPE_TYPE.TEARDROP_SHAPE: {
            const cx = (rect.minX + rect.maxX) / 2;
            const cy = (rect.minY + rect.maxY) / 2;
            const rx = width / 2;
            const ry = height / 2;
            path = `M ${cx} ${rect.minY} L ${rect.maxX} ${rect.minY} L ${rect.maxX} ${cy} A ${rx} ${ry} 0 0 1 ${cx} ${rect.maxY} A ${rx} ${ry} 0 0 1 ${rect.minX} ${cy} A ${rx} ${ry} 0 0 1 ${cx} ${rect.minY} Z`;
            break;
        }
        case SHAPE_TYPE.FRAME_SHAPE: {
            const bw = width * 0.15;
            path = `M ${rect.minX} ${rect.minY} L ${rect.maxX} ${rect.minY} L ${rect.maxX} ${rect.maxY} L ${rect.minX} ${rect.maxY} Z M ${rect.minX + bw} ${rect.minY + bw} L ${rect.minX + bw} ${rect.maxY - bw} L ${rect.maxX - bw} ${rect.maxY - bw} L ${rect.maxX - bw} ${rect.minY + bw} Z`;
            break;
        }
        case SHAPE_TYPE.HALF_CLOSED_FRAME_SHAPE: {
            const bw = Math.min(width, height) * 0.2;
            const iw = width * 0.2;
            const ih = height * 0.2;
            path = `M ${rect.minX} ${rect.minY} L ${rect.maxX} ${rect.minY} L ${rect.maxX - iw} ${rect.minY + bw} L ${rect.minX + bw} ${rect.minY + bw} L ${rect.minX + bw} ${rect.maxY - ih} L ${rect.minX} ${rect.maxY} Z`;
            break;
        }
        case SHAPE_TYPE.HORN: {
            const bw = Math.min(width, height) * 0.4;
            path = `M ${rect.minX} ${rect.minY} L ${rect.minX + bw} ${rect.minY} L ${rect.minX + bw} ${rect.maxY - bw} L ${rect.maxX} ${rect.maxY - bw} L ${rect.maxX} ${rect.maxY} L ${rect.minX} ${rect.maxY} Z`;
            break;
        }
        case SHAPE_TYPE.TWILL: {
            const wx = width * 0.5;
            const hy = height * 0.5;
            path = `M ${rect.minX + wx} ${rect.minY} L ${rect.maxX} ${rect.minY} L ${rect.minX} ${rect.maxY} L ${rect.minX} ${rect.maxY - hy} Z`;
            break;
        }
        case SHAPE_TYPE.CROSS: {
            const a = Math.min(width, height) * 0.25;
            path = `M ${rect.minX + a} ${rect.minY} L ${rect.maxX - a} ${rect.minY} L ${rect.maxX - a} ${rect.minY + a} L ${rect.maxX} ${rect.minY + a} L ${rect.maxX} ${rect.maxY - a} L ${rect.maxX - a} ${rect.maxY - a} L ${rect.maxX - a} ${rect.maxY} L ${rect.minX + a} ${rect.maxY} L ${rect.minX + a} ${rect.maxY - a} L ${rect.minX} ${rect.maxY - a} L ${rect.minX} ${rect.minY + a} L ${rect.minX + a} ${rect.minY + a} Z`;
            break;
        }
        case SHAPE_TYPE.CUTAWAY_RECTANGLE: {
            const r = Math.min(width, height) * 0.2;
            path = `M ${rect.minX + r} ${rect.minY} L ${rect.maxX - r} ${rect.minY} A ${r} ${r} 90 0 0 ${rect.maxX} ${rect.minY + r} L ${rect.maxX} ${rect.minY + r} L ${rect.maxX} ${rect.maxY - r} A ${r} ${r} 90 0 0 ${rect.maxX - r} ${rect.maxY} L ${rect.minX + r} ${rect.maxY} A ${r} ${r} 90 0 0 ${rect.minX} ${rect.maxY - r} L ${rect.minX} ${rect.minY + r} A ${r} ${r} 90 0 0 ${rect.minX + r} ${rect.minY} Z`;
            break;
        }
        case SHAPE_TYPE.RING: {
            const rx = width * 0.5;
            const ry = height * 0.5;
            const rb = Math.min(width, height) * 0.25;
            const cx = (rect.minX + rect.maxX) / 2;
            path = `M ${cx} ${rect.minY} A ${rx} ${ry} 180 0 0 ${cx} ${rect.maxY} A ${rx} ${ry} 180 0 0 ${cx} ${rect.minY} M ${cx} ${rect.minY + rb} A ${rx - rb} ${ry - rb} 180 0 1 ${cx} ${rect.maxY - rb} A ${rx - rb} ${ry - rb} 180 0 1 ${cx} ${rect.minY + rb} Z`;
            break;
        }
    }
    return needPathString ? path : new Path2D(path);
};
