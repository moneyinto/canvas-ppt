import Stage from ".";
import Listener from "../listener";
import StageConfig from "./config";
import { throttle } from "lodash";
import Command from "../command";
import { createShapeElement } from "./create";
import { IPPTElement } from "../types/element";
import { History } from "../editor/history";

export default class ControlStage extends Stage {
    private _command: Command;
    private _canMove: boolean;
    private _canCreate: boolean;
    private _startPoint: [number, number];
    private _history: History;
    constructor(container: HTMLDivElement, listener: Listener, stageConfig: StageConfig, command: Command, history: History) {
        super(container, listener, stageConfig);

        this._history = history;

        this._canMove = false;
        this._canCreate = false;
        this._startPoint = [0, 0];

        this._command = command;
        this.container.addEventListener("mousewheel", throttle(this._mousewheel.bind(this) as (evt: Event) => void, 50), false);
        this.container.addEventListener("mousedown", this._mousedown.bind(this), false);
        this.container.addEventListener("mousemove", throttle(this._mousemove.bind(this), 50), false);
        this.container.addEventListener("mouseup", this._mouseup.bind(this), false);
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
    private _getAreaPoint(startPoint: [number, number], endPoint: [number, number]) {
        const minPoint = [Math.min(startPoint[0], endPoint[0]), Math.min(startPoint[1], endPoint[1])];
        const maxPoint = [Math.max(startPoint[0], endPoint[0]), Math.max(startPoint[1], endPoint[1])];
        return { minPoint, maxPoint };
    }

    private _getElementPosition(evt: MouseEvent) {
        const zoom = this.stageConfig.zoom;

        const { x, y } = this.stageConfig.getStageArea();
        const { offsetX, offsetY } = this.stageConfig.getCanvasOffset();

        const { minPoint, maxPoint } = this._getAreaPoint(this._startPoint, [evt.pageX, evt.pageY]);

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
                newElement = createShapeElement(position, this.stageConfig.insertElement.data.type);
                break;
            }
            }
        }
        return newElement;
    }

    private _mousemove(evt: MouseEvent) {
        if (this.stageConfig.insertElement && this._canCreate) {
            // 创建元素
            const newElement = this._createElement(evt);
            if (newElement) this.drawElement(newElement);
        } else if (this._canMove && this.stageConfig.canMove) {
            // 移动画布
            const scrollX = -(evt.pageX - this._startPoint[0]) + this.stageConfig.scrollX;
            const scrollY = -(evt.pageY - this._startPoint[1]) + this.stageConfig.scrollY;
            this._startPoint = [evt.pageX, evt.pageY];
            this.stageConfig.setScroll(scrollX, scrollY);
        } else if (!this.stageConfig.insertElement && !this.stageConfig.canMove) {
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
}
