import { checkIsMac } from "@/utils";
import ContextmenuComponent from "@/components/Contextmenu/index.vue";
import { createVNode, render } from "vue";
import { IContextmenuItem } from "../types/contextmenu";
import Command from "../command";
import StageConfig from "./config";

export class Contextmenu {
    private _command: Command;
    private _stageConfig: StageConfig;
    private _menuDom: HTMLDivElement | null;
    constructor(command: Command, stageConfig: StageConfig) {
        this._command = command;
        this._stageConfig = stageConfig;
        this._menuDom = null;
    }

    private _removeContextmenu() {
        if (this._menuDom) {
            document.body.removeChild(this._menuDom);
            this._menuDom = null;
        }
    }

    public create(evt: MouseEvent) {
        const isMac = checkIsMac();
        const operateElements = this._stageConfig.operateElements;
        const selectedElement = operateElements.length > 0;
        const isTextCutCopyDisabled = () => {
            if (operateElements.length > 0 && operateElements.filter(element => element.type === "text").length > 0 && this._stageConfig.textFocus) {
                return !this._stageConfig.selectArea;
            }
            return false;
        };
        const textFocus = this._stageConfig.textFocus;
        const contextmenus: IContextmenuItem[] = [
            {
                text: "剪切",
                icon: "cut",
                subText: `${isMac ? "⌘" : "Ctrl"} + X`,
                hide: !selectedElement,
                disable: isTextCutCopyDisabled(),
                handler: () => {
                    this._command.executeCut();
                }
            },
            {
                text: "复制",
                icon: "copy",
                subText: `${isMac ? "⌘" : "Ctrl"} + C`,
                hide: !selectedElement,
                disable: isTextCutCopyDisabled(),
                handler: () => {
                    this._command.executeCopy();
                }
            },
            {
                text: "粘贴",
                icon: "paste",
                subText: `${isMac ? "⌘" : "Ctrl"} + V`,
                handler: () => {
                    this._command.executePaste();
                }
            },
            {
                text: "全选",
                icon: "allSelect",
                subText: `${isMac ? "⌘" : "Ctrl"} + A`,
                handler: () => {
                    this._command.executeSelectAll();
                }
            },
            { divider: true, hide: !selectedElement },
            {
                text: "层级排序",
                hide: !selectedElement,
                children: [
                    {
                        text: "置于顶层",
                        icon: "top",
                        handler: () => {
                            this._command.executeMoveTop();
                        }
                    },
                    {
                        text: "置于底层",
                        icon: "bottom",
                        handler: () => {
                            this._command.executeMoveDown();
                        }
                    },
                    {
                        text: "上移一层",
                        icon: "moveUp",
                        handler: () => {
                            this._command.executeMoveUp();
                        }
                    },
                    {
                        text: "下移一层",
                        icon: "moveDown",
                        handler: () => {
                            this._command.executeMoveDown();
                        }
                    }
                ]
            },
            { divider: true, hide: !textFocus },
            {
                text: "水平对齐",
                hide: !textFocus,
                children: [
                    {
                        text: "左对齐",
                        icon: "alignLeft",
                        handler: () => {
                            this._command.executeSetFontAlign("left");
                        }
                    },
                    {
                        text: "居中对齐",
                        icon: "alignCenter",
                        handler: () => {
                            this._command.executeSetFontAlign("center");
                        }
                    },
                    {
                        text: "右对齐",
                        icon: "alignRight",
                        handler: () => {
                            this._command.executeSetFontAlign("right");
                        }
                    }
                ]
            },
            {
                text: "对齐方式",
                hide: !selectedElement,
                children: [
                    {
                        text: "水平居左",
                        icon: "canvasAlignLeft",
                        handler: () => {
                            this._command.executeSetElementAlign("alignLeft");
                        }
                    },
                    {
                        text: "水平居中",
                        icon: "canvasAlignCenter",
                        handler: () => {
                            this._command.executeSetElementAlign("alignCenter");
                        }
                    },
                    {
                        text: "水平居右",
                        icon: "canvasAlignRight",
                        handler: () => {
                            this._command.executeSetElementAlign("alignLeft");
                        }
                    },
                    { divider: true },
                    {
                        text: "垂直居上",
                        icon: "canvasVerticalTop",
                        handler: () => {
                            this._command.executeSetElementAlign("verticalTop");
                        }
                    },
                    {
                        text: "垂直居中",
                        icon: "canvasVerticalCenter",
                        handler: () => {
                            this._command.executeSetElementAlign("verticalCenter");
                        }
                    },
                    {
                        text: "垂直居下",
                        icon: "canvasVerticalBottom",
                        handler: () => {
                            this._command.executeSetElementAlign("verticalBottom");
                        }
                    },
                    { divider: true },
                    {
                        text: "水平分布",
                        icon: "canvasOneAlignCenter",
                        handler: () => {
                            this._command.executeSetElementAlign("oneAlignCenter");
                        }
                    },
                    {
                        text: "垂直分布",
                        icon: "canvasOneVerticalCenter",
                        handler: () => {
                            this._command.executeSetElementAlign("oneVerticalCenter");
                        }
                    },
                    { divider: true },
                    {
                        text: "中央对齐",
                        icon: "canvasCenter",
                        handler: () => {
                            this._command.executeSetElementAlign("center");
                        }
                    }
                ]
            },
            {
                text: "翻转",
                hide: !selectedElement,
                children: [
                    {
                        text: "水平翻转",
                        icon: "flipH",
                        handler: () => {
                            this._command.executeFlipH();
                        }
                    },
                    {
                        text: "垂直翻转",
                        icon: "flipV",
                        handler: () => {
                            this._command.executeFlipV();
                        }
                    }
                ]
            },
            { divider: true, hide: !selectedElement },
            {
                text: "删除",
                subText: "Delete",
                hide: !selectedElement,
                handler: () => {
                    this._command.executeDelete();
                }
            }
        ];

        // 创建自定义菜单
        const options = {
            axis: { x: evt.pageX, y: evt.pageY },
            menus: contextmenus,
            removeContextmenu: () => {
                this._removeContextmenu();
            }
        };
        this._menuDom = document.createElement("div");
        const vm = createVNode(ContextmenuComponent, options, null);
        render(vm, this._menuDom);
        document.body.appendChild(this._menuDom);
    }
}
