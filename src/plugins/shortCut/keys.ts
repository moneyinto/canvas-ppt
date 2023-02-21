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
            command.executeDelete();
        }
    },

    {
        key: KeyMap.Delete,
        callback: (command: Command) => {
            command.executeDelete(1);
        }
    },

    {
        key: KeyMap.C,
        ctrl: true,
        callback: (command: Command) => {
            command.executeCopy();
        }
    },

    {
        key: KeyMap.X,
        ctrl: true,
        callback: (command: Command) => {
            command.executeCut();
        }
    },

    {
        key: KeyMap.V,
        ctrl: true,
        callback: (command: Command) => {
            command.executePaste();
        }
    },

    {
        key: KeyMap.Up,
        callback: (command: Command) => {
            command.executeMove(KeyMap.Up);
        }
    },

    {
        key: KeyMap.Down,
        callback: (command: Command) => {
            command.executeMove(KeyMap.Down);
        }
    },

    {
        key: KeyMap.Left,
        callback: (command: Command) => {
            command.executeMove(KeyMap.Left);
        }
    },

    {
        key: KeyMap.Right,
        callback: (command: Command) => {
            command.executeMove(KeyMap.Right);
        }
    }
];
