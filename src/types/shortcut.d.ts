import Command from "@/plugins/editor/command";
import { KeyMap } from "@/plugins/shortCut/keyMap";

export interface IRegisterShortcut {
    key: KeyMap;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    callback: (command: Command) => void;
}
