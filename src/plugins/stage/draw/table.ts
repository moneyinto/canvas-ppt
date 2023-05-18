import StageConfig from "../config";
import { Fill } from "./fill";
import { OutLine } from "./outline";
import { Shadow } from "./shadow";
import {
    IPPTElementOutline,
    IPPTTableCell,
    IPPTTableElement
} from "@/types/element";
import { SHAPE_TYPE } from "@/plugins/config/shapes";
import { getShapePath } from "@/utils/shape";

export default class Table {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _shadow: Shadow;
    private _fill: Fill;
    private _outline: OutLine;
    constructor(
        stageConfig: StageConfig,
        ctx: CanvasRenderingContext2D
    ) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._shadow = new Shadow(this._ctx);
        this._fill = new Fill(this._ctx);
        this._outline = new OutLine(this._ctx);
    }

    private _drawCell(
        x: number,
        y: number,
        cellWidth: number,
        cellHeight: number,
        cell: IPPTTableCell,
        outline?: IPPTElementOutline
    ) {
        this._ctx.save();
        this._ctx.translate(x + cellWidth / 2, y + cellHeight / 2);

        const path = getShapePath(
            SHAPE_TYPE.RECT,
            cellWidth,
            cellHeight
        ) as Path2D;

        if (cell.fill) {
            this._fill.draw(cell.fill, path);
        }

        if (outline) {
            this._outline.draw(outline, path);
        }

        this._ctx.restore();
    }

    public draw(element: IPPTTableElement) {
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

        // 平移到元素起始位置
        this._ctx.translate(-element.width / 2, -element.height / 2);

        let cellX = 0;
        let cellY = 0;
        for (let row = 0; row < element.data.length; row++) {
            const rowHeight = element.height * element.rowHeights[row];
            cellX = 0;
            for (let col = 0; col < element.data[row].length; col++) {
                const cell = element.data[row][col];
                if (cell.colspan > 0 && cell.rowspan > 0) {
                    // 可能存在浮点溢出
                    const widthRatio = element.colWidths.slice(col, col + cell.colspan).reduce((acr, cur) => {
                        return acr + cur;
                    });
                    const heightRatio = element.rowHeights.slice(row, row + cell.rowspan).reduce((acr, cur) => {
                        return acr + cur;
                    });
                    const cellWidth = element.width * widthRatio;
                    const cellHeight = element.height * heightRatio;
                    this._drawCell(
                        cellX,
                        cellY,
                        cellWidth,
                        cellHeight,
                        cell,
                        element.outline
                    );
                    cellX += cellWidth;
                }
            }
            cellY += rowHeight;
        }

        if (element.shadow) {
            this._shadow.draw(element.shadow, zoom);
        }

        this._ctx.restore();
    }
}
