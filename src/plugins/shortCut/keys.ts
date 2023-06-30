import emitter, { EmitterEvents } from "@/utils/emitter";
import Command from "../editor/command";
import { IRegisterShortcut } from "@/types/shortcut";
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
        key: KeyMap.Enter,
        callback: (command: Command) => {
            command.executeEnter();
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
        key: KeyMap.A,
        ctrl: true,
        callback: (command: Command) => {
            command.executeSelectAll();
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
    },

    // 新建页面
    {
        key: KeyMap.M,
        ctrl: true,
        callback: () => {
            emitter.emit(EmitterEvents.ADD_EMPTY_SLIDE);
        }
    },

    // 复制页面
    {
        key: KeyMap.D,
        ctrl: true,
        callback: () => {
            emitter.emit(EmitterEvents.COPY_SLIDE);
            emitter.emit(EmitterEvents.PASTE_SLIDE);
        }
    },

    // 撤销
    {
        key: KeyMap.Z,
        ctrl: true,
        callback: (command: Command) => {
            command.executeUndo();
        }
    },

    // 恢复
    {
        key: KeyMap.Z,
        ctrl: true,
        shift: true,
        callback: (command: Command) => {
            command.executeRedo();
        }
    }
];
