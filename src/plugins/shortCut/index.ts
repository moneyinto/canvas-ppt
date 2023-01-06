import Command from "../command";
import Listener from "../listener";
import StageConfig from "../stage/config";
import { IRegisterShortcut } from "../types/shortcut";
import { KeyMap } from "./keyMap";
import { ShortcutKeys } from "./keys";

export default class Shortcut {
    private _command: Command;
    private _container: HTMLDivElement;
    private _listener: Listener;
    private _stageConfig: StageConfig;
    private _shortcutKeys: IRegisterShortcut[];
    constructor(container: HTMLDivElement, listener: Listener, stageConfig: StageConfig, command: Command) {
        this._command = command;
        this._container = container;
        this._listener = listener;
        this._stageConfig = stageConfig;

        this._shortcutKeys = ShortcutKeys;
        document.addEventListener("keydown", this._agentKeydown.bind(this));
        document.addEventListener("keyup", this._agentKeyup.bind(this));
    }

    private _agentKeydown(evt: KeyboardEvent) {
        if (evt.key === KeyMap.SPACE) {
            this._stageConfig.setCanMove(true);
            if (this._listener.onCanMoveChange) this._listener.onCanMoveChange(true);
            return;
        }
        this._execute(evt, this._shortcutKeys);
    }

    private _agentKeyup(evt: KeyboardEvent) {
        if (evt.key === KeyMap.SPACE) {
            this._stageConfig.setCanMove(false);
            if (this._listener.onCanMoveChange) this._listener.onCanMoveChange(false);
        }
    }

    private _execute(evt: KeyboardEvent, shortCutList: IRegisterShortcut[]) {
        for (let s = 0; s < shortCutList.length; s++) {
            const shortCut = shortCutList[s];
            if (
                (evt.ctrlKey === !!shortCut.ctrl ||
                    evt.metaKey === !!shortCut.ctrl) &&
                evt.shiftKey === !!shortCut.shift &&
                evt.altKey === !!shortCut.alt &&
                evt.key === shortCut.key
            ) {
                shortCut.callback(this._command);
                break;
            }
        }
        evt.preventDefault();
    }
}
