import Command from "../command";
import { IRegisterShortcut } from "../types/shortcut";
import { KeyMap } from "./keyMap";

export const ShortcutKeys: IRegisterShortcut[] = [
    {
        key: KeyMap.MINUS,
        ctrl: true,
        callback: (command: Command) => {
            command.executeDecrease();
        }
    },

    {
        key: KeyMap.EQUAL,
        ctrl: true,
        callback: (command: Command) => {
            command.executeIncrease();
        }
    },

    {
        key: KeyMap.Backspace,
        callback: (command: Command) => {
            command.excuteDelete();
        }
    },

    {
        key: KeyMap.Delete,
        callback: (command: Command) => {
            command.excuteDelete();
        }
    },

    {
        key: KeyMap.C,
        ctrl: true,
        callback: (command: Command) => {
            command.excuteCopy();
        }
    },

    {
        key: KeyMap.X,
        ctrl: true,
        callback: (command: Command) => {
            command.excuteCut();
        }
    },

    {
        key: KeyMap.V,
        ctrl: true,
        callback: (command: Command) => {
            command.excutePaste();
        }
    }
];
