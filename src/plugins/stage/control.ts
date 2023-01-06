import Stage from ".";
import Listener from "../listener";
import StageConfig from "./config";
import { throttle } from "lodash";
import Command from "../command";

export default class ControlStage extends Stage {
    private _command: Command;
    constructor(container: HTMLDivElement, listener: Listener, stageConfig: StageConfig, command: Command) {
        super(container, listener, stageConfig);

        this._command = command;
        container.addEventListener("mousewheel", throttle(this._mousewheel.bind(this) as (evt: Event) => void, 50), false);
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
}
