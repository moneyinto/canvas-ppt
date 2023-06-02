import StageConfig from "../config";
import { Fill } from "./fill";
import { OutLine } from "./outline";
import { Shadow } from "./shadow";
import {
    IPPTElementFill,
    IPPTElementOutline,
    IPPTTableCell,
    IPPTTableElement
} from "@/types/element";
import { SHAPE_TYPE } from "@/plugins/config/shapes";
import { getShapePath } from "@/utils/shape";
import tinycolor from "tinycolor2";
import { RichText } from "./richText";

interface ITheme {
    color: string;
    headerColor?: string;
    subColor1: string;
    subColor2: string;
}

export default class Table {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _shadow: Shadow;
    private _fill: Fill;
    private _outline: OutLine;
    private _richText: RichText;
    constructor(
        stageConfig: StageConfig,
        ctx: CanvasRenderingContext2D
    ) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._shadow = new Shadow(this._ctx);
        this._fill = new Fill(this._ctx);
        this._outline = new OutLine(this._ctx);
        this._richText = new RichText(stageConfig, ctx);
    }

    private _drawCell(
        x: number,
        y: number,
        cellWidth: number,
        cellHeight: number,
        element: IPPTTableElement,
        cell: IPPTTableCell,
        row: number,
        col: number,
        theme: ITheme,
        isSelected: boolean,
        fill?: IPPTElementFill,
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
        } else if (fill) {
            this._fill.draw(fill, path);
        } else if (theme) {
            if (theme.headerColor) {
                if (row === 0) {
                    this._fill.draw({ color: theme.headerColor }, path);
                } else if (row % 2 === 0) {
                    this._fill.draw({ color: theme.subColor1 }, path);
                } else {
                    this._fill.draw({ color: theme.subColor2 }, path);
                }
            } else {
                if (row % 2 === 0) {
                    this._fill.draw({ color: theme.subColor1 }, path);
                } else {
                    this._fill.draw({ color: theme.subColor2 }, path);
                }
            }
        }

        if (isSelected) {
            this._fill.draw({ color: "#000000", opacity: 70 }, path);
        }

        if (outline) {
            this._outline.draw(outline, path);
        }

        if (cell.content && cell.content.length > 0) {
            const height = this._stageConfig.getTextHeight(element, [row, col]);
            const offsetY = (cellHeight - height) / 2;
            this._ctx.translate(-cellWidth / 2, -cellHeight / 2 + offsetY);
            this._richText.renderContent(element, [row, col]);
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

        if (element.shadow) {
            this._ctx.save();
            this._shadow.draw(element.shadow, zoom);

            // 增加白底
            const path = getShapePath(
                SHAPE_TYPE.RECT,
                element.width,
                element.height
            ) as Path2D;
            this._fill.draw({ color: "#ffffff" }, path);
            this._ctx.restore();
        }

        // 平移到元素起始位置
        this._ctx.translate(-element.width / 2, -element.height / 2);

        const themeColor = tinycolor(element.theme.color);
        const subColor1 = themeColor.setAlpha(0.3).toHex8String();
        const subColor2 = themeColor.setAlpha(0.1).toHex8String();

        const theme: ITheme = {
            color: element.theme.color,
            subColor1,
            subColor2
        };

        if (element.theme.rowHeader) {
            theme.headerColor = themeColor.setAlpha(1).toHex8String();
        }

        let cellX = 0;
        let cellY = 0;
        let startRow = -1;
        let startCol = -1;
        let endRow = -1;
        let endCol = -1;
        const tableSelectCells = this._stageConfig.tableSelectCells;
        if (tableSelectCells) {
            startRow = Math.min(tableSelectCells[0][0], tableSelectCells[1][0]);
            startCol = Math.min(tableSelectCells[0][1], tableSelectCells[1][1]);
            endRow = Math.max(tableSelectCells[0][0], tableSelectCells[1][0]);
            endCol = Math.max(tableSelectCells[0][1], tableSelectCells[1][1]);
        }
        for (let row = 0; row < element.data.length; row++) {
            const rowHeight = element.height * element.rowHeights[row];
            cellX = 0;
            for (let col = 0; col < element.data[row].length; col++) {
                const cell = element.data[row][col];
                let cellWidth = 0;
                if (cell.colspan > 0) {
                    // 可能存在浮点溢出
                    const widthRatio = element.colWidths.slice(col, col + cell.colspan).reduce((acr, cur) => {
                        return acr + cur;
                    });

                    cellWidth = element.width * widthRatio;
                }
                if (cell.colspan > 0 && cell.rowspan > 0) {
                    const heightRatio = element.rowHeights.slice(row, row + cell.rowspan).reduce((acr, cur) => {
                        return acr + cur;
                    });
                    const cellHeight = element.height * heightRatio;

                    // 当只存在一格选中时，不做选中绘制处理
                    const isSelectedCell = row >= startRow && row <= endRow && col >= startCol && col <= endCol && !(startRow === endRow && startCol === endCol);
                    this._drawCell(
                        cellX,
                        cellY,
                        cellWidth,
                        cellHeight,
                        element,
                        cell,
                        row,
                        col,
                        theme,
                        isSelectedCell,
                        element.fill,
                        element.outline
                    );
                }
                cellX += cellWidth;
            }
            cellY += rowHeight;
        }

        this._ctx.restore();
    }
}
