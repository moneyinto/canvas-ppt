import { deepClone } from "@/utils";
import {
    CLIPBOARD_STRING_TYPE,
    copyText,
    pasteCustomClipboardString,
    readClipboard
} from "@/utils/clipboard";
import {
    createImageElement,
    createRandomCode,
    createTextElement
} from "@/utils/create";
import { encrypt } from "@/utils/crypto";
import { baseFontConfig } from "../config/font";
import { History } from "../editor/history";
import Listener from "../listener";
import { KeyMap } from "../shortCut/keyMap";
import StageConfig, { TEXT_MARGIN } from "../stage/config";
import { Cursor } from "../stage/cursor";
import {
    IPPTElement,
    IPPTElementOutline,
    IPPTImageElement,
    IPPTShapeElement,
    IPPTTextElement
} from "../types/element";
import { IFontData } from "../types/font";
import { VIEWPORT_SIZE, VIEWRATIO } from "../config/stage";
import { IElementAlignType } from "../types";

export default class Command {
    private _stageConfig: StageConfig;
    private _listener: Listener;
    private _history: History;
    private _cursor: Cursor;

    private _updateDebounce: null | number;
    constructor(
        stageConfig: StageConfig,
        listener: Listener,
        history: History,
        cursor: Cursor
    ) {
        this._stageConfig = stageConfig;
        this._listener = listener;
        this._history = history;
        this._cursor = cursor;

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
            const zIndex = slide?.elements.findIndex(
                (element) => element.id === operateElement.id
            );
            if (
                slide &&
                slide.elements &&
                typeof zIndex !== "undefined" &&
                zIndex > -1
            ) {
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
            const zIndex = slide?.elements.findIndex(
                (element) => element.id === operateElement.id
            );
            if (
                slide &&
                slide.elements &&
                typeof zIndex !== "undefined" &&
                zIndex > -1
            ) {
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
            const zIndex = slide?.elements.findIndex(
                (element) => element.id === operateElement.id
            );
            if (
                slide &&
                slide.elements &&
                typeof zIndex !== "undefined" &&
                zIndex > -1
            ) {
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
            const zIndex = slide?.elements.findIndex(
                (element) => element.id === operateElement.id
            );
            if (
                slide &&
                slide.elements &&
                typeof zIndex !== "undefined" &&
                zIndex > -1
            ) {
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
        const operateElement = this._stageConfig.operateElement as
            | IPPTImageElement
            | IPPTShapeElement;
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
        const operateElement = this._stageConfig.operateElement as
            | IPPTImageElement
            | IPPTShapeElement;
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
        const operateElement = this._stageConfig
            .operateElement as IPPTShapeElement;
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
        const operateElement = this._stageConfig.operateElement as
            | IPPTShapeElement
            | IPPTImageElement
            | IPPTTextElement;
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
        const operateElement = this._stageConfig.operateElement as
            | IPPTShapeElement
            | IPPTTextElement;
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
            if (this._stageConfig.textFocus) {
                const selectArea = this._stageConfig.selectArea;
                if (selectArea) {
                    const { startX, endX } = this._stageConfig.getSelectArea(
                        selectArea,
                        operateElement as IPPTTextElement
                    );
                    const copyContent = (
                        operateElement as IPPTTextElement
                    ).content.slice(startX, endX);
                    await copyText(
                        encrypt(
                            `${CLIPBOARD_STRING_TYPE.TEXT}${JSON.stringify(
                                copyContent
                            )}`
                        )
                    );
                }
            } else {
                // 将元素json数据加密存入剪切板
                await copyText(
                    encrypt(
                        `${CLIPBOARD_STRING_TYPE.ELEMENT}${JSON.stringify(
                            operateElement
                        )}`
                    )
                );
            }
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
        if (content.indexOf(CLIPBOARD_STRING_TYPE.SLIDE) > -1) return;
        if (content.indexOf(CLIPBOARD_STRING_TYPE.ELEMENT) > -1) {
            // 粘贴的内容为元素数据
            const resultText = content.replace(
                CLIPBOARD_STRING_TYPE.ELEMENT,
                ""
            );
            const element = pasteCustomClipboardString(
                resultText
            ) as IPPTElement;
            // 粘贴的内容为元素数据
            element.id = createRandomCode();
            // 新元素较旧元素偏移一段距离
            element.left += 10;
            element.top += 10;

            this.executeAddRender(element);

            // 再次写入剪切板，为了下一次粘贴能够在上一次的基础上进行偏移
            await copyText(
                encrypt(
                    `${CLIPBOARD_STRING_TYPE.ELEMENT}${JSON.stringify(element)}`
                )
            );
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
        } else if (content.indexOf(CLIPBOARD_STRING_TYPE.TEXT) > -1) {
            const resultText = content.replace(CLIPBOARD_STRING_TYPE.TEXT, "");
            const elementContent = pasteCustomClipboardString(
                resultText
            ) as IFontData[];
            const operateElement = this._stageConfig.operateElement;
            if (
                operateElement &&
                operateElement.type === "text" &&
                this._stageConfig.textFocus
            ) {
                const selectArea = this._stageConfig.selectArea;
                if (selectArea) {
                    // 选中区域存在替换选中区域
                    this._deleteSelectText();
                }

                // 光标位置粘贴
                const position = this._cursor.getDataPosition();
                operateElement.content.splice(
                    position + 1,
                    0,
                    ...elementContent
                );
                operateElement.height = this._getTextHeight(operateElement);
                const cursorPosition = position + elementContent.length;
                this.executeUpdateRender(operateElement, true);
                this._updateCursor(cursorPosition);
            }
        } else {
            // 普通外来文本
            // 这里考虑是否带格式，先处理不带格式的
            if (content) {
                const operateElement = this._stageConfig.operateElement;
                if (
                    operateElement &&
                    operateElement.type === "text" &&
                    this._stageConfig.textFocus
                ) {
                    const selectArea = this._stageConfig.selectArea;
                    if (selectArea) {
                        // 选中区域存在替换选中区域
                        this._deleteSelectText();
                    }

                    // 光标位置粘贴
                    const config = this._stageConfig.fontConfig;
                    const baseText: IFontData = {
                        value: "",
                        fontSize: config.fontSize,
                        fontFamily: config.fontFamily,
                        fontWeight: config.fontWeight,
                        fontColor: config.fontColor,
                        fontStyle: config.fontStyle,
                        width: config.fontSize,
                        height: config.fontSize,
                        underline: config.underline,
                        strikout: config.strikout
                    };
                    const elementContent: IFontData[] = [];
                    content.split("").forEach((text) => {
                        baseText.value = text;
                        this._resetTextFontSize(baseText);
                        elementContent.push(deepClone(baseText));
                    });
                    const position = this._cursor.getDataPosition();
                    operateElement.content.splice(
                        position + 1,
                        0,
                        ...elementContent
                    );
                    operateElement.height = this._getTextHeight(operateElement);
                    const cursorPosition = position + elementContent.length;
                    this.executeUpdateRender(operateElement, true);
                    this._updateCursor(cursorPosition);
                } else {
                    const baseText: IFontData = {
                        value: "",
                        fontSize: baseFontConfig.fontSize,
                        fontFamily: baseFontConfig.fontFamily,
                        fontWeight: baseFontConfig.fontWeight,
                        fontColor: baseFontConfig.fontColor,
                        fontStyle: baseFontConfig.fontStyle,
                        width: baseFontConfig.fontSize,
                        height: baseFontConfig.fontSize,
                        underline: baseFontConfig.underline,
                        strikout: baseFontConfig.strikout
                    };
                    const pasteContent: IFontData[] = [];
                    let contentWidth = TEXT_MARGIN * 2;
                    const newElement = createTextElement({
                        left: 0,
                        top: 0,
                        width: 0,
                        height: 0
                    });
                    content.split("").forEach((text) => {
                        baseText.value = text;
                        this._resetTextFontSize(baseText);
                        contentWidth += baseText.width + newElement.wordSpace;
                        pasteContent.push(deepClone(baseText));
                    });
                    newElement.content.splice(0, 0, ...pasteContent);
                    newElement.width = contentWidth;
                    newElement.height = this._getTextHeight(newElement);
                    this.executeAddRender(newElement);
                }
            }
        }
    }

    // 删除元素 或 删除文本
    public executeDelete(direction = 0) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            if (this._stageConfig.textFocus) {
                if (this._cursor.getTextareaText()) return;
                if (this._stageConfig.selectArea) {
                    // 删除选中文本
                    this._deleteSelectText();
                } else {
                    // 删除文本
                    const position = this._cursor.getDataPosition();
                    const result = this._deleteText(position + direction);

                    // 当存在中英文混合时 删除正好某行空一个英文字符的空格，删除后正好有个英文字符将会填充到上一行，光标应该处理该行倒数第二个字符
                    if (result && direction === 0) {
                        this._updateCursor(position - 1);
                    }
                }
            } else {
                this.executeDeleteRender(operateElement);
            }
        }
    }

    // 选中位置字体更新字体样式配置
    public executeUpdateFontConfig() {
        // 获取前一个字的样式，设置config
        const operateElement = this._stageConfig
            .operateElement as IPPTTextElement;
        if (operateElement && this._stageConfig.textFocus) {
            const currentDataPosition = this._cursor.getDataPosition();
            const content = operateElement.content;
            // 前面一个字没有，获取后面一个回车符的字样
            const text =
                currentDataPosition === -1
                    ? content[0]
                    : content[currentDataPosition];

            const config = {
                fontSize: text.fontSize,
                fontColor: text.fontColor,
                fontFamily: text.fontFamily,
                fontStyle: text.fontStyle,
                fontWeight: text.fontWeight,
                underline: text.underline,
                strikout: text.strikout
            };
            this._stageConfig.setFontConfig(config);

            this._listener.onFontSizeChange &&
                this._listener.onFontSizeChange(config.fontSize);
            this._listener.onFontWeightChange &&
                this._listener.onFontWeightChange(config.fontWeight === "bold");
            this._listener.onFontStyleChange &&
                this._listener.onFontStyleChange(config.fontStyle === "italic");
            this._listener.onFontUnderLineChange &&
                this._listener.onFontUnderLineChange(config.underline);
            this._listener.onFontStrikoutChange &&
                this._listener.onFontStrikoutChange(config.strikout);
            this._listener.onFontFamilyChange &&
                this._listener.onFontFamilyChange(config.fontFamily);
        }
    }

    // 获取文本变更后文本框高度
    private _getTextHeight(operateElement: IPPTTextElement) {
        const renderContent =
            this._stageConfig.getRenderContent(operateElement);
        let height = TEXT_MARGIN * 2;
        renderContent.forEach((line) => {
            height += line.height * operateElement.lineHeight;
        });
        return height;
    }

    // 删除选中文本
    private _deleteSelectText() {
        const operateElement = this._stageConfig
            .operateElement as IPPTTextElement;
        const selectArea = this._stageConfig.selectArea;
        if (operateElement && selectArea) {
            const { startX, endX } = this._stageConfig.getSelectArea(
                selectArea,
                operateElement
            );
            operateElement.content.splice(startX, endX - startX);
            operateElement.height = this._getTextHeight(operateElement);

            this._stageConfig.setSelectArea(null);

            this.executeUpdateRender(operateElement, true);

            this._updateCursor(startX - 1);
        }
    }

    // 删除文本内容
    private _deleteText(position: number) {
        const operateElement = this._stageConfig
            .operateElement as IPPTTextElement;
        if (operateElement) {
            if (
                position >= operateElement.content.length - 1 ||
                position === -1
            ) return false;
            operateElement.content.splice(position, 1);
            operateElement.height = this._getTextHeight(operateElement);

            this.executeUpdateRender(operateElement);

            this._debounceLog();
            return true;
        }
        return false;
    }

    // 元素移动 及 光标移动
    public executeMove(direction: string) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            if (this._stageConfig.textFocus) {
                // 光标移动
                switch (direction) {
                    case KeyMap.Up: {
                        const position = this._cursor.getDataPosition();
                        const renderPosition =
                            this._cursor.getRenderDataPosition();
                        if (renderPosition[0] > 0) {
                            const renderContent =
                                this._stageConfig.getRenderContent(
                                    operateElement as IPPTTextElement
                                );

                            const currentLineData =
                                renderContent[renderPosition[0]];
                            let currentLeft = this._stageConfig.getAlignOffsetX(
                                currentLineData,
                                operateElement as IPPTTextElement
                            );
                            for (const [
                                index,
                                data
                            ] of currentLineData.texts.entries()) {
                                if (index <= renderPosition[1]) {
                                    currentLeft += data.width;
                                }
                            }

                            const upLineData =
                                renderContent[renderPosition[0] - 1];
                            let upLineX = -1;
                            let upLeft = this._stageConfig.getAlignOffsetX(
                                upLineData,
                                operateElement as IPPTTextElement
                            );
                            for (const data of upLineData.texts) {
                                if (upLeft <= currentLeft) {
                                    upLineX++;
                                    upLeft += data.width;
                                } else {
                                    break;
                                }
                            }

                            // 处理光标在行首的情况
                            if (upLineX === -1) upLineX = 0;

                            this._updateCursor(
                                position -
                                    (renderPosition[1] +
                                        1 +
                                        upLineData.texts.length -
                                        upLineX)
                            );
                        }
                        break;
                    }
                    case KeyMap.Down: {
                        const position = this._cursor.getDataPosition();
                        const renderPosition =
                            this._cursor.getRenderDataPosition();
                        const renderContent =
                            this._stageConfig.getRenderContent(
                                operateElement as IPPTTextElement
                            );
                        if (renderPosition[0] < renderContent.length - 1) {
                            const currentLineData =
                                renderContent[renderPosition[0]];
                            let currentLeft = this._stageConfig.getAlignOffsetX(
                                currentLineData,
                                operateElement as IPPTTextElement
                            );
                            for (const [
                                index,
                                data
                            ] of currentLineData.texts.entries()) {
                                if (index <= renderPosition[1]) {
                                    currentLeft += data.width;
                                }
                            }

                            const downLineData =
                                renderContent[renderPosition[0] + 1];
                            let downLineX = -1;
                            let downLeft = this._stageConfig.getAlignOffsetX(
                                downLineData,
                                operateElement as IPPTTextElement
                            );
                            for (const data of downLineData.texts) {
                                if (downLeft <= currentLeft) {
                                    downLineX++;
                                    downLeft += data.width;
                                } else {
                                    break;
                                }
                            }

                            // 处理光标在行首的情况
                            if (downLineX === -1) downLineX = 0;

                            this._updateCursor(
                                position +
                                    (currentLineData.texts.length -
                                        (renderPosition[1] + 1) +
                                        downLineX)
                            );
                        }
                        break;
                    }
                    case KeyMap.Left: {
                        const position = this._cursor.getDataPosition();

                        this._updateCursor(position - 1);
                        break;
                    }
                    case KeyMap.Right: {
                        const position = this._cursor.getDataPosition();
                        this._updateCursor(position + 1);
                        break;
                    }
                }
            } else {
                // 元素移动
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
                        operateElement.left = Math.floor(
                            operateElement.left - 1
                        );
                        break;
                    }
                    case KeyMap.Right: {
                        operateElement.left = Math.ceil(
                            operateElement.left + 1
                        );
                        break;
                    }
                }

                this.executeUpdateRender(operateElement);

                this._debounceLog();
            }
        }
    }

    // 回车键
    public executeEnter() {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            // 文本框编辑时回车
            if (this._stageConfig.textFocus) {
                if (this._cursor.getTextareaText()) return;
                const config = this._stageConfig.fontConfig;
                const text: IFontData = {
                    value: "\n",
                    fontSize: config.fontSize,
                    fontFamily: config.fontFamily,
                    fontWeight: config.fontWeight,
                    fontColor: config.fontColor,
                    fontStyle: config.fontStyle,
                    underline: config.underline,
                    strikout: config.strikout,
                    width: 0,
                    height: 0
                };
                const currentDataPosition = this._cursor.getDataPosition();
                this.executeAddText(text, currentDataPosition + 1);
                this._updateCursor(currentDataPosition + 1);
            }
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
    public executeUpdateRender(elements: IPPTElement[], addHistory?: boolean) {
        this._stageConfig.updateOperateElements(elements);
        this._stageConfig.updateElements(elements);

        if (addHistory) {
            this.executeLogRender();
        } else {
            this.executeRender();
        }
    }

    // 元素新增及渲染
    public executeAddRender(element: IPPTElement) {
        this._stageConfig.addElement(element);
        this._stageConfig.setOperateElement(element, false);

        this.executeLogRender();
    }

    // 元素删除及渲染
    public executeDeleteRender(elements: IPPTElement[]) {
        const slide = this._stageConfig.getCurrentSlide();
        if (slide && slide.elements) {
            slide.elements = slide.elements.filter(ele => elements.findIndex(element =>  element.id === ele.id) === -1);
            this._stageConfig.setOperateElement(null, false);

            this.executeLogRender();
        }
    }

    // 文本输入
    public executeAddText(text: IFontData, position: number) {
        const operateElement = this._stageConfig
            .operateElement as IPPTTextElement;
        if (operateElement) {
            operateElement.content.splice(position, 0, text);
            operateElement.height = this._getTextHeight(operateElement);

            this.executeUpdateRender(operateElement);

            this._debounceLog();
        }
    }

    // 循环选中文本
    private _forSelectTexts(
        element: IPPTTextElement,
        selectArea: [number, number, number, number],
        callback: (text: IFontData) => void
    ) {
        const renderContent = this._stageConfig.getRenderContent(element);
        const [startX, startY, endX, endY] = selectArea;
        renderContent.forEach((lineData, line) => {
            if (line >= startY && line <= endY) {
                lineData.texts.forEach((text, index) => {
                    if (
                        (startY === endY && startX <= index && index < endX) ||
                        (startY !== endY &&
                            line === startY &&
                            startX <= index) ||
                        (startY !== endY && line !== startY && line !== endY) ||
                        (startY !== endY && line === endY && index <= endX)
                    ) {
                        callback && callback(text);
                    }
                });
            }
        });
    }

    // 重置text中字体宽高数据
    private _resetTextFontSize(text: IFontData) {
        const { width, height } = this._stageConfig.getFontSize!(text);
        text.width = width;
        text.height = height;
    }

    // 设置文本字体大小
    public executeSetFontSize(fontSize: number, type?: "plus" | "minus") {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement && operateElement.type === "text") {
            if (this._stageConfig.textFocus) {
                const selectArea = this._stageConfig.selectArea;
                if (selectArea) {
                    this._forSelectTexts(operateElement, selectArea, (text) => {
                        text.fontSize = !type
                            ? fontSize
                            : type === "plus"
                            ? text.fontSize + fontSize
                            : text.fontSize - fontSize;
                        this._resetTextFontSize(text);
                    });
                } else {
                    // 聚焦但未选中文本，只修改字体样式配置
                    const config = this._stageConfig.fontConfig;
                    this._stageConfig.setFontConfig({
                        ...config,
                        fontSize: (config.fontSize = !type
                            ? fontSize
                            : type === "plus"
                            ? config.fontSize + fontSize
                            : config.fontSize - fontSize)
                    });
                }
                // 设置完后 文本框聚焦
                this._cursor.setInputFocus();
            } else {
                // 未聚焦文本框，直接设置整个文本框内容字体大小
                operateElement.content.forEach((text) => {
                    text.fontSize = !type
                        ? fontSize
                        : type === "plus"
                        ? text.fontSize + fontSize
                        : text.fontSize - fontSize;
                    this._resetTextFontSize(text);
                });
            }

            operateElement.height = this._getTextHeight(operateElement);

            this.executeUpdateRender(operateElement);

            this._debounceLog();
        }
    }

    // 设置字体粗细
    public executeSetFontWeight(bold: boolean) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement && operateElement.type === "text") {
            if (this._stageConfig.textFocus) {
                const selectArea = this._stageConfig.selectArea;
                if (selectArea) {
                    this._forSelectTexts(operateElement, selectArea, (text) => {
                        text.fontWeight = bold ? "bold" : "normal";
                        this._resetTextFontSize(text);
                    });
                } else {
                    // 聚焦但未选中文本，只修改字体样式配置
                    const config = this._stageConfig.fontConfig;
                    this._stageConfig.setFontConfig({
                        ...config,
                        fontWeight: bold ? "bold" : "normal"
                    });
                }
                // 设置完后 文本框聚焦
                this._cursor.setInputFocus();
            } else {
                // 未聚焦文本框，直接设置整个文本框内容字体
                operateElement.content.forEach((text) => {
                    text.fontWeight = bold ? "bold" : "normal";
                    this._resetTextFontSize(text);
                });
            }

            operateElement.height = this._getTextHeight(operateElement);

            this.executeUpdateRender(operateElement);

            this._debounceLog();
        }
    }

    // 设置字体斜体
    public executeSetFontStyle(italic: boolean) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement && operateElement.type === "text") {
            if (this._stageConfig.textFocus) {
                const selectArea = this._stageConfig.selectArea;
                if (selectArea) {
                    this._forSelectTexts(operateElement, selectArea, (text) => {
                        text.fontStyle = italic ? "italic" : "normal";
                        this._resetTextFontSize(text);
                    });
                } else {
                    // 聚焦但未选中文本，只修改字体样式配置
                    const config = this._stageConfig.fontConfig;
                    this._stageConfig.setFontConfig({
                        ...config,
                        fontStyle: italic ? "italic" : "normal"
                    });
                }
                // 设置完后 文本框聚焦
                this._cursor.setInputFocus();
            } else {
                // 未聚焦文本框，直接设置整个文本框内容字体
                operateElement.content.forEach((text) => {
                    text.fontStyle = italic ? "italic" : "normal";
                    this._resetTextFontSize(text);
                });
            }

            operateElement.height = this._getTextHeight(operateElement);

            this.executeUpdateRender(operateElement);

            this._debounceLog();
        }
    }

    // 设置字体下划线
    public executeSetFontUnderLine(underline: boolean) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement && operateElement.type === "text") {
            if (this._stageConfig.textFocus) {
                const selectArea = this._stageConfig.selectArea;
                if (selectArea) {
                    this._forSelectTexts(operateElement, selectArea, (text) => {
                        text.underline = underline;
                        this._resetTextFontSize(text);
                    });
                } else {
                    // 聚焦但未选中文本，只修改字体样式配置
                    const config = this._stageConfig.fontConfig;
                    this._stageConfig.setFontConfig({
                        ...config,
                        underline
                    });
                }
                // 设置完后 文本框聚焦
                this._cursor.setInputFocus();
            } else {
                // 未聚焦文本框，直接设置整个文本框内容字体
                operateElement.content.forEach((text) => {
                    text.underline = underline;
                    this._resetTextFontSize(text);
                });
            }

            operateElement.height = this._getTextHeight(operateElement);

            this.executeUpdateRender(operateElement);

            this._debounceLog();
        }
    }

    // 设置字体删除线
    public executeSetFontStrikout(strikout: boolean) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement && operateElement.type === "text") {
            if (this._stageConfig.textFocus) {
                const selectArea = this._stageConfig.selectArea;
                if (selectArea) {
                    this._forSelectTexts(operateElement, selectArea, (text) => {
                        text.strikout = strikout;
                        this._resetTextFontSize(text);
                    });
                } else {
                    // 聚焦但未选中文本，只修改字体样式配置
                    const config = this._stageConfig.fontConfig;
                    this._stageConfig.setFontConfig({
                        ...config,
                        strikout
                    });
                }
                // 设置完后 文本框聚焦
                this._cursor.setInputFocus();
            } else {
                // 未聚焦文本框，直接设置整个文本框内容字体
                operateElement.content.forEach((text) => {
                    text.strikout = strikout;
                    this._resetTextFontSize(text);
                });
            }

            operateElement.height = this._getTextHeight(operateElement);

            this.executeUpdateRender(operateElement);

            this._debounceLog();
        }
    }

    // 设置字体颜色
    public executeSetFontColor(fontColor: string) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement && operateElement.type === "text") {
            if (this._stageConfig.textFocus) {
                const selectArea = this._stageConfig.selectArea;
                if (selectArea) {
                    this._forSelectTexts(operateElement, selectArea, (text) => {
                        text.fontColor = fontColor;
                    });
                } else {
                    // 聚焦但未选中文本，只修改字体样式配置
                    const config = this._stageConfig.fontConfig;
                    this._stageConfig.setFontConfig({
                        ...config,
                        fontColor
                    });
                }
                // 设置完后 文本框聚焦
                this._cursor.setInputFocus();
            } else {
                // 未聚焦文本框，直接设置整个文本框内容字体
                operateElement.content.forEach((text) => {
                    text.fontColor = fontColor;
                });
            }

            this.executeUpdateRender(operateElement);

            this._debounceLog();
        }
    }

    // 设置字体
    public executeSetFontFamily(fontFamily: string) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement && operateElement.type === "text") {
            if (this._stageConfig.textFocus) {
                const selectArea = this._stageConfig.selectArea;
                if (selectArea) {
                    this._forSelectTexts(operateElement, selectArea, (text) => {
                        text.fontFamily = fontFamily;
                    });
                } else {
                    // 聚焦但未选中文本，只修改字体样式配置
                    const config = this._stageConfig.fontConfig;
                    this._stageConfig.setFontConfig({
                        ...config,
                        fontFamily
                    });
                }
                // 设置完后 文本框聚焦
                this._cursor.setInputFocus();
            } else {
                // 未聚焦文本框，直接设置整个文本框内容字体
                operateElement.content.forEach((text) => {
                    text.fontFamily = fontFamily;
                });
            }

            this.executeUpdateRender(operateElement);

            this._debounceLog();
        }
    }

    // 设置文本对齐方式
    public executeSetFontAlign(align: "left" | "center" | "right") {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement && operateElement.type === "text") {
            operateElement.align = align;

            this.executeUpdateRender(operateElement, true);

            const position = this._cursor.getDataPosition();
            this._updateCursor(position);
        }
    }

    // 设置文本行距
    public executeSetLineHeight(lineHeight: number) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement && operateElement.type === "text") {
            operateElement.lineHeight = lineHeight;
            operateElement.height = this._getTextHeight(operateElement);
            this.executeUpdateRender(operateElement, true);
        }
    }

    private setAlignElement(
        operateElement: IPPTElement,
        align: IElementAlignType
    ) {
        const width = operateElement.type === "line" ? operateElement.end[0] - operateElement.start[0] : operateElement.width;
        const height = operateElement.type === "line" ? operateElement.end[1] - operateElement.start[1] : operateElement.height;
        switch (align) {
            case "canvasAlignLeft": {
                operateElement.left = 0;
                break;
            }
            case "canvasAlignCenter": {
                operateElement.left = (VIEWPORT_SIZE - width) / 2;
                break;
            }
            case "canvasAlignRight": {
                operateElement.left = VIEWPORT_SIZE - width;
                break;
            }
            case "canvasCenter": {
                operateElement.left = (VIEWPORT_SIZE - width) / 2;
                operateElement.top = (VIEWPORT_SIZE * VIEWRATIO - height) / 2;
                break;
            }
            case "canvasOneAlignCenter": {
                operateElement.left = (VIEWPORT_SIZE - width) / 2;
                break;
            }
            case "canvasOneVerticalCenter": {
                operateElement.top = (VIEWPORT_SIZE * VIEWRATIO - height) / 2;
                break;
            }
            case "canvasVerticalTop": {
                operateElement.top = 0;
                break;
            }
            case "canvasVerticalCenter": {
                operateElement.top = (VIEWPORT_SIZE * VIEWRATIO - height) / 2;
                break;
            }
            case "canvasVerticalBottom": {
                operateElement.top = VIEWPORT_SIZE * VIEWRATIO - height;
                break;
            }
        }
        return operateElement;
    }

    // 设置元素对齐
    public executeSetElementAlign(
        align: IElementAlignType
    ) {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            const element = this.setAlignElement(operateElement, align);

            this.executeUpdateRender(element, true);
        }
    }

    private _updateCursor(position: number) {
        this._cursor.showCursor();
        this._cursor.setDataPosition(position);
        this._cursor.setCursorPositionByData();
        this._cursor.updateCursor();

        this._cursor.setInputFocus();

        this.executeUpdateFontConfig();
    }

    private _debounceLog() {
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
