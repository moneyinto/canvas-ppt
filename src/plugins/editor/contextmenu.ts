import { checkIsMac } from "@/utils";
import ContextmenuComponent from "@/components/Contextmenu/index.vue";
import { createVNode, render } from "vue";
import { IContextmenuItem } from "@/types/contextmenu";
import Command from "./command";
import StageConfig from "../stage/config";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { PANELS } from "@/utils/panel";
import { IPPTTableElement } from "@/types/element";

export default class Contextmenu {
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
        const canFlip = operateElements.filter(element => (element.type === "shape" || element.type === "image" || element.type === "latex" || element.type === "chart")).length > 0;
        const isTextCutCopyDisabled = () => {
            if (operateElements.length > 0 && operateElements.filter(element => element.type === "text").length > 0 && this._stageConfig.textFocus) {
                return !this._stageConfig.selectArea;
            }
            return false;
        };
        let isMergeCell = false;
        let onlyOneCell = false; // 是否只有一个单元格，非合并的单元格
        let onlyOneRow = false;
        let onlyOneCol = false;
        let mouseRow = 0;
        let mouseCol = 0;
        if (this._stageConfig.tableSelectCells) {
            // 单元格选中状态
            const [start, end] = this._stageConfig.tableSelectCells;
            const startRow = Math.min(start[0], end[0]);
            const startCol = Math.min(start[1], end[1]);
            const endRow = Math.max(start[0], end[0]);
            const endCol = Math.max(start[1], end[1]);

            // 先要判断右击是否在选中的单元格内
            const { left, top } = this._stageConfig.getMousePosition(evt);
            const opreateElement = operateElements.find(element => element.id === this._stageConfig.tableEditElementID) as IPPTTableElement;
            if (opreateElement) {
                const { row, col } = this._stageConfig.getMouseTableCell(opreateElement, left, top);
                mouseRow = row;
                mouseCol = col;
                if (row >= startRow && row <= endRow && col >= startCol && col <= endCol) {
                    isMergeCell = !(startRow === endRow && startCol === endCol);
                    // 如果存在合并的单元格，禁止合并
                    for (let i = startRow; i <= endRow; i++) {
                        for (let j = startCol; j <= endCol; j++) {
                            const { colspan, rowspan } = opreateElement.data[i][j];
                            if (colspan > 1 || rowspan > 1) {
                                isMergeCell = false;
                                break;
                            }
                        }
                    }
                    if (!isMergeCell) {
                        const { colspan, rowspan } = opreateElement.data[row][col];
                        onlyOneCell = colspan === 1 && rowspan === 1;
                    }
                } else {
                    this._stageConfig.tableSelectCells = null;
                }

                onlyOneRow = opreateElement.rowHeights.length === 1;
                onlyOneCol = opreateElement.colWidths.length === 1;
            } else {
                this._stageConfig.tableSelectCells = null;
            }
        }
        const tableCellEdit = !!this._stageConfig.tableSelectCells;
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
            { divider: true, hide: selectedElement },
            {
                text: "新建页面",
                hide: selectedElement,
                subText: `${isMac ? "⌘" : "Ctrl"} + M`,
                handler: () => {
                    emitter.emit(EmitterEvents.ADD_EMPTY_SLIDE);
                }
            },
            {
                text: "复制页面",
                hide: selectedElement,
                subText: `${isMac ? "⌘" : "Ctrl"} + D`,
                handler: () => {
                    emitter.emit(EmitterEvents.COPY_SLIDE);
                    emitter.emit(EmitterEvents.PASTE_SLIDE);
                }
            },
            {
                text: "删除页面",
                hide: selectedElement,
                subText: "⌫",
                handler: () => {
                    emitter.emit(EmitterEvents.DELETE_SLIDE);
                }
            },
            { divider: true, hide: !selectedElement },
            {
                text: "删除",
                subText: "Delete",
                hide: !selectedElement,
                handler: () => {
                    this._command.executeDelete();
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
                            this._command.executeMoveBottom();
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
                hide: !selectedElement || !canFlip,
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
            { divider: true, hide: !tableCellEdit },
            {
                hide: !tableCellEdit,
                text: "插入行",
                children: [
                    {
                        text: "上方插入",
                        handler: () => {
                            this._command.executeInsertRow(mouseRow);
                        }
                    },
                    {
                        text: "下方插入",
                        handler: () => {
                            this._command.executeInsertRow(mouseRow + 1);
                        }
                    }
                ]
            },
            {
                hide: !tableCellEdit,
                text: "插入列",
                children: [
                    {
                        text: "左侧插入",
                        handler: () => {
                            this._command.executeInsertCol(mouseCol);
                        }
                    },
                    {
                        text: "右侧插入",
                        handler: () => {
                            this._command.executeInsertCol(mouseCol + 1);
                        }
                    }
                ]
            },
            {
                hide: !tableCellEdit,
                text: "删除行",
                disable: onlyOneRow,
                handler: () => {
                    this._command.executeDeleteRow(mouseRow);
                }
            },
            {
                hide: !tableCellEdit,
                text: "删除列",
                disable: onlyOneCol,
                handler: () => {
                    this._command.executeDeleteCol(mouseCol);
                }
            },
            {
                hide: !tableCellEdit,
                disable: !isMergeCell,
                text: "合并单元格",
                icon: "mergeCell",
                handler: () => {
                    this._command.executeMergeCell();
                }
            },
            {
                hide: !tableCellEdit,
                disable: isMergeCell || onlyOneCell,
                text: "拆分单元格",
                icon: "splitCell",
                handler: () => {
                    this._command.executeSplitCell();
                }
            },
            { divider: true },
            {
                text: "锁定",
                icon: "lock",
                size: 18,
                handler: () => {
                    this._command.executeLockElements();
                }
            },
            { divider: true },
            {
                text: "背景设置",
                hide: selectedElement,
                icon: "background",
                handler: () => {
                    emitter.emit(EmitterEvents.SHOW_PANELS, true);
                    emitter.emit(EmitterEvents.PANELS_TYPE, PANELS.BACKGROUND);
                }
            },
            {
                text: "元素动画",
                icon: "animation",
                handler: () => {
                    emitter.emit(EmitterEvents.SHOW_PANELS, true);
                    emitter.emit(EmitterEvents.PANELS_TYPE, PANELS.ANIMATION);
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
