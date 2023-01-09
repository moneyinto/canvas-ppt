import Stage from ".";
import Listener from "../listener";
import StageConfig from "./config";
import { throttle } from "lodash";
import Command from "../command";
import { createShapeElement } from "./create";
import { IPPTElement } from "../types/element";
import { History } from "../editor/history";
import { THEME_COLOR } from "../config/stage";
import { IRectParameter, IRects } from "../types";

export default class ControlStage extends Stage {
    private _command: Command;
    private _canMove: boolean;
    private _canCreate: boolean;
    private _startPoint: [number, number];
    private _history: History;
    constructor(
        container: HTMLDivElement,
        listener: Listener,
        stageConfig: StageConfig,
        command: Command,
        history: History
    ) {
        super(container, listener, stageConfig);

        this._history = history;

        this._canMove = false;
        this._canCreate = false;
        this._startPoint = [0, 0];

        this._command = command;
        this.container.addEventListener(
            "mousewheel",
            throttle(this._mousewheel.bind(this) as (evt: Event) => void, 50),
            false
        );
        this.container.addEventListener(
            "mousedown",
            this._mousedown.bind(this),
            false
        );
        this.container.addEventListener(
            "mousemove",
            throttle(this._mousemove.bind(this), 50),
            false
        );
        this.container.addEventListener(
            "mouseup",
            this._mouseup.bind(this),
            false
        );
    }

    private _mousewheel(evt: WheelEvent) {
        if (evt.ctrlKey || evt.metaKey) {
            if (evt.deltaY > 0) {
                this._command.executeDecrease();
            } else {
                this._command.executeIncrease();
            }
        }
    }

    private _mousedown(evt: MouseEvent) {
        this._canMove = !this.stageConfig.insertElement;
        this._canCreate = !!this.stageConfig.insertElement;
        this._startPoint = [evt.pageX, evt.pageY];

        if (!this.stageConfig.insertElement && !this.stageConfig.canMove) {
            const { left, top } = this._getMousePosition(evt);
            const opreateElement = this.stageConfig.getMouseInElement(
                left,
                top
            );
            this.stageConfig.setOpreateElement(opreateElement || null);
            this.stageConfig.resetCheckDrawView();
            if (opreateElement) {
                this.resetDrawOprate();
            } else {
                this.clear();
            }
        }
    }

    private _mousemove(evt: MouseEvent) {
        if (this.stageConfig.insertElement && this._canCreate) {
            // 创建元素
            const newElement = this._createElement(evt);
            if (newElement) this.drawElement(newElement);
        } else if (this._canMove && this.stageConfig.canMove) {
            // 移动画布
            const scrollX =
                -(evt.pageX - this._startPoint[0]) + this.stageConfig.scrollX;
            const scrollY =
                -(evt.pageY - this._startPoint[1]) + this.stageConfig.scrollY;
            this._startPoint = [evt.pageX, evt.pageY];
            this.stageConfig.setScroll(scrollX, scrollY);
        } else if (
            !this.stageConfig.insertElement &&
            !this.stageConfig.canMove
        ) {
            // 悬浮到元素
            const { left, top } = this._getMousePosition(evt);
            const hoverElement = this.stageConfig.getMouseInElement(left, top);

            if (hoverElement) {
                if (this.container.style.cursor !== "move") this.container.style.cursor = "move";
            } else {
                if (this.container.style.cursor !== "default") this.container.style.cursor = "default";
            }
        }
    }

    private _mouseup(evt: MouseEvent) {
        if (this.stageConfig.insertElement && this._canCreate) {
            const newElement = this._createElement(evt);
            if (newElement) {
                this.stageConfig.addElement(newElement);

                this._history.add(JSON.stringify(this.stageConfig.slides));
            }
            this.stageConfig.setInsertElement(null);
        }
        this._canMove = false;
        this._canCreate = false;
    }

    // 处理获取矩形区域的左上坐标点和左下坐标点
    private _getAreaPoint(
        startPoint: [number, number],
        endPoint: [number, number]
    ) {
        const minPoint = [
            Math.min(startPoint[0], endPoint[0]),
            Math.min(startPoint[1], endPoint[1])
        ];
        const maxPoint = [
            Math.max(startPoint[0], endPoint[0]),
            Math.max(startPoint[1], endPoint[1])
        ];
        return { minPoint, maxPoint };
    }

    private _getElementPosition(evt: MouseEvent) {
        const zoom = this.stageConfig.zoom;

        const { x, y } = this.stageConfig.getStageArea();
        const { offsetX, offsetY } = this.stageConfig.getCanvasOffset();

        const { minPoint, maxPoint } = this._getAreaPoint(this._startPoint, [
            evt.pageX,
            evt.pageY
        ]);

        const left = (minPoint[0] - x - offsetX) / zoom;
        const top = (minPoint[1] - y - offsetY) / zoom;
        const width = (maxPoint[0] - minPoint[0]) / zoom;
        const height = (maxPoint[1] - minPoint[1]) / zoom;

        return { left, top, width, height };
    }

    private _getMousePosition(evt: MouseEvent) {
        const zoom = this.stageConfig.zoom;

        const { x, y } = this.stageConfig.getStageArea();
        const { offsetX, offsetY } = this.stageConfig.getCanvasOffset();

        const left = (evt.pageX - x - offsetX) / zoom;
        const top = (evt.pageY - y - offsetY) / zoom;

        return { left, top };
    }

    private _createElement(evt: MouseEvent) {
        let newElement: IPPTElement | undefined;
        if (this.stageConfig.insertElement && this._canCreate) {
            this.clear();

            const position = this._getElementPosition(evt);

            switch (this.stageConfig.insertElement.type) {
            case "shape": {
                newElement = createShapeElement(
                    position,
                    this.stageConfig.insertElement.data.type
                );
                break;
            }
            }
        }
        return newElement;
    }

    /**
     *
     * @param param0 获取选中区域的九点区域坐标
     * @returns
     */
    private _getElementResizePoints(
        x: number,
        y: number,
        elementWidth: number,
        elementHeight: number,
        dashedLinePadding: number,
        resizeRectWidth: number
    ) {
        const LEFT_X = x - dashedLinePadding - resizeRectWidth;
        const RIGH_X = x + elementWidth + dashedLinePadding;
        const CENTER_X = (RIGH_X + LEFT_X) / 2;
        const TOP_Y = y - dashedLinePadding - resizeRectWidth;
        const BOTTOM_Y = y + elementHeight + dashedLinePadding;
        const CENTER_Y = (BOTTOM_Y + TOP_Y) / 2;

        const LEFT_TOP: IRectParameter = [
            LEFT_X,
            TOP_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const LEFT: IRectParameter = [
            LEFT_X,
            CENTER_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const LEFT_BOTTOM: IRectParameter = [
            LEFT_X,
            BOTTOM_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const TOP: IRectParameter = [
            CENTER_X,
            TOP_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const BOTTOM: IRectParameter = [
            CENTER_X,
            BOTTOM_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const RIGHT_TOP: IRectParameter = [
            RIGH_X,
            TOP_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const RIGHT: IRectParameter = [
            RIGH_X,
            CENTER_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const RIGHT_BOTTOM: IRectParameter = [
            RIGH_X,
            BOTTOM_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const ANGLE: IRectParameter = [
            CENTER_X,
            TOP_Y - resizeRectWidth * 2,
            resizeRectWidth,
            resizeRectWidth
        ];
        return {
            LEFT_TOP,
            LEFT,
            LEFT_BOTTOM,
            TOP,
            BOTTOM,
            RIGHT_TOP,
            RIGHT,
            RIGHT_BOTTOM,
            ANGLE
        };
    }

    private _drawOprate(element: IPPTElement) {
        const zoom = this.stageConfig.zoom;
        if (!element) return;
        const { x, y } = this.stageConfig.getStageOrigin();

        this.ctx.save();

        // 缩放画布
        this.ctx.scale(zoom, zoom);

        const ox = x + element.left + element.width / 2;
        const oy = y + element.top + element.height / 2;

        // 平移坐标原点
        this.ctx.translate(ox, oy);
        // 旋转画布
        this.ctx.rotate((element.rotate / 360) * Math.PI);

        this.ctx.strokeStyle = THEME_COLOR;
        this.ctx.lineWidth = 1 / zoom;
        // 增加选中框与元素的间隙距离
        const margin = 1;
        const offsetX = -element.width / 2 - margin;
        const offsetY = -element.height / 2 - margin;
        this.ctx.strokeRect(
            offsetX,
            offsetY,
            element.width + margin * 2,
            element.height + margin * 2
        );

        const dashedLinePadding = 0 + margin / zoom;
        const dashWidth = 8 / zoom;

        const rects: IRects = this._getElementResizePoints(offsetX, offsetY, element.width + margin * 2, element.height + margin * 2, dashedLinePadding, dashWidth);
        this.ctx.fillStyle = "#ffffff";
        for (const key in rects) {
            this.ctx.fillRect(...rects[key]);
            this.ctx.strokeRect(...rects[key]);
        }

        this.ctx.restore();
    }

    public resetDrawOprate() {
        this.clear();
        const element = this.stageConfig.opreateElement;
        if (!element) return;
        this.drawElement(element);
        this._drawOprate(element);
    }
}
