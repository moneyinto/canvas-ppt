import { checkIsMac } from "@/utils";
import Command from "../command";
import StageConfig from "../stage/config";
import { IRegisterShortcut } from "../types/shortcut";
import { KeyMap } from "./keyMap";
import { ShortcutKeys } from "./keys";

export default class Shortcut {
    private _command: Command;
    private _stageConfig: StageConfig;
    private _shortcutKeys: IRegisterShortcut[];
    constructor(container: HTMLDivElement, stageConfig: StageConfig, command: Command) {
        this._command = command;
        this._stageConfig = stageConfig;

        this._shortcutKeys = ShortcutKeys;

        container.tabIndex = 0;
        container.style.outline = "0";
        container.addEventListener("keydown", this._agentKeydown.bind(this));
        container.addEventListener("keyup", this._agentKeyup.bind(this));
    }

    private _agentKeydown(evt: KeyboardEvent) {
        if (evt.key === KeyMap.SPACE) {
            this._stageConfig.setCanMove(true);
            return;
        }
        this._execute(evt, this._shortcutKeys);
    }

    private _agentKeyup(evt: KeyboardEvent) {
        if (evt.key === KeyMap.SPACE) {
            this._stageConfig.setCanMove(false);
        }
    }

    private _execute(evt: KeyboardEvent, shortCutList: IRegisterShortcut[]) {
        let isPreventDefault = false;
        for (let s = 0; s < shortCutList.length; s++) {
            const shortCut = shortCutList[s];
            if (
                ((checkIsMac() ? evt.metaKey : evt.ctrlKey) === !!shortCut.ctrl) &&
                evt.shiftKey === !!shortCut.shift &&
                evt.altKey === !!shortCut.alt &&
                evt.key === shortCut.key
            ) {
                shortCut.callback(this._command);
                isPreventDefault = true;
                break;
            }
        }
        if (isPreventDefault) evt.preventDefault();
        setTimeout(() => {
            (evt.target as HTMLDivElement).focus();
        }, 100);
    }
}
