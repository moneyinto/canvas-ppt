import Command from "../command";
import { IRegisterShortcut } from "../types/shortcut";
import { ShortcutKeys } from "./keys";

export default class Shortcut {
    private _command: Command;
    private _container: HTMLDivElement;
    private _shortcutKeys: IRegisterShortcut[];
    constructor(container: HTMLDivElement, command: Command) {
        this._command = command;
        this._container = container;

        this._shortcutKeys = ShortcutKeys;
        document.addEventListener("keydown", this._agentKeydown.bind(this));
    }

    private _agentKeydown(evt: KeyboardEvent) {
        this._execute(evt, this._shortcutKeys);
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
