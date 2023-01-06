import Stage from ".";
import Listener from "../listener";
import StageConfig from "./config";
import { throttle } from "lodash";
import Command from "../command";

export default class ControlStage extends Stage {
    private _command: Command;
    private _canMove: boolean;
    private _startPoint: [number, number];
    constructor(container: HTMLDivElement, listener: Listener, stageConfig: StageConfig, command: Command) {
        super(container, listener, stageConfig);

        this._canMove = false;
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
        this._canMove = true;
        this._startPoint = [evt.pageX, evt.pageY];
    }

    private _mouseup() {
        this._canMove = false;
    }

    private _mousemove(evt: MouseEvent) {
        if (this._canMove && this.stageConfig.canMove) {
            const scrollX = -(evt.pageX - this._startPoint[0]) + this.stageConfig.scrollX;
            const scrollY = -(evt.pageY - this._startPoint[1]) + this.stageConfig.scrollY;
            this._startPoint = [evt.pageX, evt.pageY];
            this.stageConfig.setScroll(scrollX, scrollY);
        }
    }
}
