import Command from "../command";
import { KeyMap } from "../shortCut/keyMap";

export interface IRegisterShortcut {
    key: KeyMap;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    callback: (command: Command) => void;
}
