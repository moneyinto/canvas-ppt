import { CLIPBOARD_STRING_TYPE, copyText, pasteCustomClipboardString, readClipboard } from "@/utils/clipboard";
import { createImageElement, createRandomCode } from "@/utils/create";
import { encrypt } from "@/utils/crypto";
import { History } from "../editor/history";
import { KeyMap } from "../shortCut/keyMap";
import StageConfig from "../stage/config";
import { IPPTElement, IPPTElementOutline, IPPTImageElement, IPPTShapeElement } from "../types/element";

export default class Command {
    private _stageConfig: StageConfig;
    private _history: History;

    private _updateDebounce: null | number;
    constructor(stageConfig: StageConfig, history: History) {
        this._stageConfig = stageConfig;
        this._history = history;

        this._updateDebounce = null;
    }

    public getZoom() {
        return this._stageConfig.zoom;
    }

    // 适配
    public executeFitZoom() {
        this._stageConfig.resetBaseZoom();
    }

    // 缩小
    public executeDecrease() {
        const minZoom = this._stageConfig.getFitZoom();
        const zoom = this.getZoom();

        if (zoom - 0.05 >= minZoom) {
            this._stageConfig.setZoom(zoom - 0.05);
        } else if (zoom > minZoom) {
            this._stageConfig.setZoom(minZoom);
        }
    }

    // 放大
    public executeIncrease() {
        const zoom = this.getZoom();

        // 考虑是否要加上限
        this._stageConfig.setZoom(zoom + 0.05);
    }

    // 上移一层
    public executeMoveUp() {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            const slide = this._stageConfig.getCurrentSlide();
            const zIndex = slide?.elements.findIndex(element => element.id === operateElement.id);
            if (slide && slide.elements && typeof zIndex !== "undefined" && zIndex > -1) {
                // 已经处在顶层，无法继续移动
                if (zIndex === slide.elements.length - 1) return;

                // 移动
                const movedElement = slide.elements.splice(zIndex, 1)[0];
                slide.elements.splice(zIndex + 1, 0, movedElement);

                this.executeLogRender();
            }
        }
    }

    // 下移一层
    public executeMoveDown() {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            const slide = this._stageConfig.getCurrentSlide();
            const zIndex = slide?.elements.findIndex(element => element.id === operateElement.id);
            if (slide && slide.elements && typeof zIndex !== "undefined" && zIndex > -1) {
                // 已经处在底，无法继续移动
                if (zIndex === 0) return;

                // 移动
                const movedElement = slide.elements.splice(zIndex, 1)[0];
                slide.elements.splice(zIndex - 1, 0, movedElement);

                this.executeLogRender();
            }
        }
    }

    // 置于顶层
    public executeMoveTop() {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            const slide = this._stageConfig.getCurrentSlide();
            const zIndex = slide?.elements.findIndex(element => element.id === operateElement.id);
            if (slide && slide.elements && typeof zIndex !== "undefined" && zIndex > -1) {
                // 已经处在顶层，无法继续移动
                if (zIndex === slide.elements.length - 1) return;

                // 移动
                const movedElement = slide.elements.splice(zIndex, 1)[0];
                slide.elements.push(movedElement);

                this.executeLogRender();
            }
        }
    }

    // 置于底层
    public executeMoveBottom() {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            const slide = this._stageConfig.getCurrentSlide();
            const zIndex = slide?.elements.findIndex(element => element.id === operateElement.id);
            if (slide && slide.elements && typeof zIndex !== "undefined" && zIndex > -1) {
                // 已经处在底，无法继续移动
                if (zIndex === 0) return;

                // 移动
                const movedElement = slide.elements.splice(zIndex, 1)[0];
                slide.elements.unshift(movedElement);

                this.executeLogRender();
            }
        }
    }

    // 水平翻转
    public executeFlipH() {
        const operateElement = this._stageConfig.operateElement as IPPTImageElement | IPPTShapeElement;
        if (operateElement) {
            const newElement: IPPTElement = {
                ...operateElement,
                flipH: operateElement.flipH === -1 ? 1 : -1
            };

            this.executeUpdateRender(newElement, true);
        }
    }

    // 垂直翻转
    public executeFlipV() {
        const operateElement = this._stageConfig.operateElement as IPPTImageElement | IPPTShapeElement;
        if (operateElement) {
            const newElement: IPPTElement = {
                ...operateElement,
                flipV: operateElement.flipV === -1 ? 1 : -1
            };

            this.executeUpdateRender(newElement, true);
        }
    }

    // 设置填充色
    public executeFillColor(color: string) {
        const operateElement = this._stageConfig.operateElement as IPPTShapeElement;
        if (operateElement) {
            const newElement = {
                ...operateElement,
                fill: color
            };

            this.executeUpdateRender(newElement, true);
        }
    }

    // 填充透明度设置
    public executeOpacity(value: number) {
        const operateElement = this._stageConfig.operateElement as IPPTShapeElement | IPPTImageElement;
        if (operateElement) {
            const newElement = {
                ...operateElement,
                opacity: value
            };

            this.executeUpdateRender(newElement, true);
        }
    }

    // 修改边框
    public executeOutline(outline?: IPPTElementOutline) {
        const operateElement = this._stageConfig.operateElement as IPPTShapeElement;
        if (operateElement) {
            const newElement = {
                ...operateElement,
                outline
            };

            if (!outline) delete newElement.outline;

            this.executeUpdateRender(newElement, true);
        }
    }

    // 复制
    public async executeCopy() {
        const operateElement = this._stageConfig.operateElement;
        // 选中元素时
        if (operateElement) {
            // 将元素json数据加密存入剪切板
            await copyText(encrypt(`${CLIPBOARD_STRING_TYPE.ELEMENT}${JSON.stringify(operateElement)}`));
        }
    }

    // 剪切
    public async executeCut() {
        await this.executeCopy();
        await this.executeDelete();
    }

    // 粘贴
    public async executePaste() {
        const content = await readClipboard();
        if (content.indexOf(CLIPBOARD_STRING_TYPE.ELEMENT) > -1) {
            // 粘贴的内容为元素数据
            const resultText = content.replace(CLIPBOARD_STRING_TYPE.ELEMENT, "");
            const element = pasteCustomClipboardString(resultText) as IPPTElement;
            // 粘贴的内容为元素数据
            element.id = createRandomCode();
            // 新元素较旧元素偏移一段距离
            element.left += 10;
            element.top += 10;

            this.executeAddRender(element);

            // 再次写入剪切板，为了下一次粘贴能够在上一次的基础上进行偏移
            await copyText(encrypt(`${CLIPBOARD_STRING_TYPE.ELEMENT}${JSON.stringify(element)}`));
        } else if (content.indexOf(CLIPBOARD_STRING_TYPE.IMAGE) > -1) {
            // 粘贴外来图片
            const image = new Image();
            image.onload = () => {
                const element = createImageElement(
                    image.width,
                    image.height,
                    content
                );
                this.executeAddRender(element);
            };
            image.src = content;
        }
    }

    // 删除元素
    public executeDelete() {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            this.executeDeleteRender(operateElement);
        }
    }

    // 元素移动
    public executeMove(direction: string) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            switch (direction) {
                case KeyMap.Up: {
                    operateElement.top = Math.floor(operateElement.top - 1);
                    break;
                }
                case KeyMap.Down: {
                    operateElement.top = Math.ceil(operateElement.top + 1);
                    break;
                }
                case KeyMap.Left: {
                    operateElement.left = Math.floor(operateElement.left - 1);
                    break;
                }
                case KeyMap.Right: {
                    operateElement.left = Math.ceil(operateElement.left + 1);
                    break;
                }
            }

            this.executeUpdateRender(operateElement);

            // 更新记录做防抖延迟
            if (this._updateDebounce) {
                clearTimeout(this._updateDebounce);
                this._updateDebounce = null;
            }

            this._updateDebounce = setTimeout(() => {
                this.executeLogRender();
                this._updateDebounce = null;
            }, 1000);
        }
    }

    // 渲染
    public executeRender() {
        this._stageConfig.resetCheckDrawOprate();
        this._stageConfig.resetCheckDrawView();
    }

    // 元素历史记录并渲染
    public executeLogRender() {
        this._history.add();

        this.executeRender();
    }

    // 元素更新及渲染
    public executeUpdateRender(element: IPPTElement, addHistory?: boolean) {
        this._stageConfig.setOperateElement(element);
        this._stageConfig.updateElement(element);

        if (addHistory) {
            this.executeLogRender();
        } else {
            this.executeRender();
        }
    }

    // 元素新增及渲染
    public executeAddRender(element: IPPTElement) {
        this._stageConfig.addElement(element);
        this._stageConfig.setOperateElement(element);

        this.executeLogRender();
    }

    // 元素删除及渲染
    public executeDeleteRender(element: IPPTElement) {
        const slide = this._stageConfig.getCurrentSlide();
        const index = slide?.elements.findIndex(ele => ele.id === element.id);
        if (typeof index !== "undefined" && index > -1) {
            slide?.elements.splice(index, 1);
            this._stageConfig.setOperateElement(null);

            this.executeLogRender();
        }
    }
}
