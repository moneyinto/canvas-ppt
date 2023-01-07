import Stage from ".";
import Listener from "../listener";
import StageConfig from "./config";
import { throttle } from "lodash";
import Command from "../command";
import { createShapeElement } from "./create";
import { IElementPosition, IPPTElement } from "../types/element";

export default class ControlStage extends Stage {
    private _command: Command;
    private _canMove: boolean;
    private _canCreate: boolean;
    private _startPoint: [number, number];
    constructor(container: HTMLDivElement, listener: Listener, stageConfig: StageConfig, command: Command) {
        super(container, listener, stageConfig);

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
            if (newElement) this.stageConfig.addElement(newElement);
            this.stageConfig.setInsertElement(null);
        }
        this._canMove = false;
        this._canCreate = false;
    }

    private _getElementPosition(evt: MouseEvent): IElementPosition {
        const zoom = this.stageConfig.zoom;

        const { x, y } = this.stageConfig.getStageArea();
        const { offsetX, offsetY } = this.stageConfig.getCanvasOffset();

        const left = (this._startPoint[0] - x - offsetX) / zoom;
        const top = (this._startPoint[1] - y - offsetY) / zoom;
        const width = (evt.pageX - this._startPoint[0]) / zoom;
        const height = (evt.pageY - this._startPoint[1]) / zoom;

        return { left, top, width, height };
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
            const newElement = this._createElement(evt);
            if (newElement) this.drawElement(newElement);
        } else if (this._canMove && this.stageConfig.canMove) {
            const scrollX = -(evt.pageX - this._startPoint[0]) + this.stageConfig.scrollX;
            const scrollY = -(evt.pageY - this._startPoint[1]) + this.stageConfig.scrollY;
            this._startPoint = [evt.pageX, evt.pageY];
            this.stageConfig.setScroll(scrollX, scrollY);
        }
    }
}
