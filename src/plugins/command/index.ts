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
import History from "../editor/history";
import Listener from "../listener";
import { KeyMap } from "../shortCut/keyMap";
import StageConfig, { TEXT_MARGIN } from "../stage/config";
import { Cursor } from "../stage/cursor";
import {
    IPPTAudioElement,
    IPPTElement,
    IPPTElementFill,
    IPPTElementOutline,
    IPPTElementShadow,
    IPPTLineElement,
    IPPTShapeElement,
    IPPTTableCell,
    IPPTTableElement,
    IPPTTableTheme,
    IPPTTextElement,
    IPPTVideoElement
} from "@/types/element";
import { IFontData, ITextStyle } from "@/types/font";
import { VIEWPORT_SIZE, VIEWRATIO } from "../config/stage";
import { IElementAlignType } from "@/types";
import { IPPTAnimation, ISlideBackground } from "@/types/slide";
import { OPTION_TYPE } from "../config/options";

export default class Command {
    private _stageConfig: StageConfig;
    private _listener: Listener;
    private _history: History;
    private _cursor: Cursor;

    private _updateDebounce: null | number | NodeJS.Timeout;
    private _addTextRenderThrottle: null | Date;
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
        this._addTextRenderThrottle = null;
    }

    public getZoom() {
        return this._stageConfig.zoom;
    }

    // 适配
    public executeFitZoom() {
        this._stageConfig.resetBaseZoom();
    }

    // 设置背景
    public executeSetBackground(background: ISlideBackground | undefined) {
        this._stageConfig.setBackground(background);

        this.executeLogRender();
    }

    // 设置背景到全部
    public executeApplyBackgroundAll() {
        this._stageConfig.applyBackgroundAll();

        this._history.add(OPTION_TYPE.APPLY_BACKGROUND_ALL);
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

    // 旋转
    public executeRotate(rotate: number, direction: 1 | -1) {
        const operateElements = this._stageConfig.operateElements;
        if (operateElements.length > 0) {
            for (const operateElement of operateElements) {
                if (operateElement.type === "line") {
                    const start = [operateElement.left, operateElement.top];
                    const end = [
                        operateElement.left + operateElement.end[0],
                        operateElement.top + operateElement.end[1]
                    ];
                    const center = [
                        (start[0] + end[0]) / 2,
                        (start[1] + end[1]) / 2
                    ];
                    const startResult = this._stageConfig.rotate(
                        start[0],
                        start[1],
                        center[0],
                        center[1],
                        ((rotate * direction) / 180) * Math.PI
                    );
                    const endResult = this._stageConfig.rotate(
                        end[0],
                        end[1],
                        center[0],
                        center[1],
                        ((rotate * direction) / 180) * Math.PI
                    );
                    operateElement.left = startResult[0];
                    operateElement.top = startResult[1];
                    operateElement.end = [
                        endResult[0] - startResult[0],
                        endResult[1] - startResult[1]
                    ];
                } else {
                    operateElement.rotate =
                        operateElement.rotate + rotate * direction;
                }
            }
            this.executeLogRender();
        }
    }

    // 上移一层
    public executeMoveUp() {
        const operateElements = this._stageConfig.operateElements;
        if (operateElements.length > 0) {
            const slide = this._stageConfig.getCurrentSlide();
            // 对多选元素先进行排序
            // 不然相邻的元素会出现不变化的现象
            const sortElements =
                slide?.elements
                    .filter(
                        (element) =>
                            operateElements.findIndex(
                                (ele) => ele.id === element.id
                            ) > -1
                    )
                    .reverse() || [];
            let isChange = false;
            for (const operateElement of sortElements) {
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
                    isChange = true;
                }
            }
            if (isChange) this.executeLogRender();
        }
    }

    // 下移一层
    public executeMoveDown() {
        const operateElements = this._stageConfig.operateElements;
        if (operateElements.length > 0) {
            const slide = this._stageConfig.getCurrentSlide();
            let isChange = false;
            const sortElements =
                slide?.elements
                    .filter(
                        (element) =>
                            operateElements.findIndex(
                                (ele) => ele.id === element.id
                            ) > -1
                    )
                    .reverse() || [];
            for (const operateElement of sortElements) {
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
                    isChange = true;
                }
            }
            if (isChange) this.executeLogRender();
        }
    }

    // 置于顶层
    public executeMoveTop() {
        const operateElements = this._stageConfig.operateElements;
        if (operateElements.length > 0) {
            const slide = this._stageConfig.getCurrentSlide();
            let isChange = false;
            for (const operateElement of operateElements) {
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
                    isChange = true;
                }
            }
            if (isChange) this.executeLogRender();
        }
    }

    // 置于底层
    public executeMoveBottom() {
        const operateElements = this._stageConfig.operateElements;
        if (operateElements.length > 0) {
            const slide = this._stageConfig.getCurrentSlide();
            let isChange = false;
            for (const operateElement of operateElements) {
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
                    isChange = true;
                }
            }
            if (isChange) this.executeLogRender();
        }
    }

    // 水平翻转
    public executeFlipH() {
        const operateElements = this._stageConfig.operateElements;
        const newElements: IPPTElement[] = [];
        for (const operateElement of operateElements) {
            if (
                operateElement.type === "shape" ||
                operateElement.type === "image" ||
                operateElement.type === "chart" ||
                operateElement.type === "latex"
            ) {
                const newElement: IPPTElement = {
                    ...operateElement,
                    flipH: operateElement.flipH === -1 ? 1 : -1
                };

                newElements.push(newElement);
            }
        }
        this.executeUpdateRender(newElements, true);
    }

    // 垂直翻转
    public executeFlipV() {
        const operateElements = this._stageConfig.operateElements;
        const newElements: IPPTElement[] = [];
        for (const operateElement of operateElements) {
            if (
                operateElement.type === "shape" ||
                operateElement.type === "image" ||
                operateElement.type === "chart" ||
                operateElement.type === "latex"
            ) {
                const newElement: IPPTElement = {
                    ...operateElement,
                    flipV: operateElement.flipV === -1 ? 1 : -1
                };

                newElements.push(newElement);
            }
        }
        this.executeUpdateRender(newElements, true);
    }

    // 设置阴影
    public executeShadow(shadow: IPPTElementShadow | undefined) {
        const operateElements = this._stageConfig.operateElements;
        const newElements: IPPTElement[] = [];
        for (const operateElement of operateElements) {
            if (operateElement) {
                const newElement = {
                    ...operateElement,
                    shadow
                };
                newElements.push(newElement);
            }
        }

        this.executeUpdateRender(newElements);

        this._debounceLog();
    }

    // 设置填充色
    public executeFill(fill?: IPPTElementFill) {
        const operateElements = this._stageConfig.operateElements;
        const newElements: IPPTElement[] = [];
        for (const operateElement of operateElements) {
            if (operateElement) {
                const newElement = {
                    ...operateElement
                };

                if (
                    newElement.type === "shape" ||
                    newElement.type === "text" ||
                    newElement.type === "image" ||
                    newElement.type === "latex" ||
                    newElement.type === "chart"
                ) {
                    newElement.fill = {
                        ...newElement.fill,
                        ...fill
                    };
                } else if (newElement.type === "table") {
                    const tableSelectCells = this._stageConfig.tableSelectCells;
                    if (tableSelectCells) {
                        const [start, end] = tableSelectCells;
                        const [startRow, startCol] = start;
                        const [endRow, endCol] = end;
                        for (let i = startRow; i <= endRow; i++) {
                            for (let j = startCol; j <= endCol; j++) {
                                if (newElement.data[i][j]) {
                                    newElement.data[i][j].fill = {
                                        ...newElement.data[i][j].fill,
                                        ...fill
                                    };
                                }
                            }
                        }
                    } else {
                        // 先移除单元格的所有颜色配置
                        for (const row of newElement.data) {
                            for (const cell of row) {
                                if (cell) {
                                    cell.fill = undefined;
                                }
                            }
                        }
                        newElement.fill = {
                            ...newElement.fill,
                            ...fill
                        };
                    }
                }

                newElements.push(newElement);
            }
        }
        this.executeUpdateRender(newElements, true);
    }

    // 透明度设置
    public executeImageOpacity(value: number) {
        const operateElements = this._stageConfig.operateElements;
        const newElements: IPPTElement[] = [];
        for (const operateElement of operateElements) {
            if (
                operateElement &&
                (operateElement.type === "image" ||
                    operateElement.type === "chart" ||
                    operateElement.type === "latex")
            ) {
                const newElement = {
                    ...operateElement,
                    opacity: value
                };

                newElements.push(newElement);
            }
        }
        this.executeUpdateRender(newElements, true);
    }

    // 修改边框
    public executeOutline(outline?: IPPTElementOutline) {
        const operateElements = this._stageConfig.operateElements;
        const newElements: IPPTElement[] = [];
        for (const operateElement of operateElements) {
            if (operateElement && operateElement.type === "line") {
                const newElement: IPPTLineElement = {
                    ...operateElement
                };

                if (outline?.color) newElement.color = outline.color;
                if (outline?.width) newElement.borderWidth = outline.width;
                if (outline?.style) newElement.style = outline.style;
                if (outline?.opacity) newElement.opacity = outline.opacity;
                newElements.push(newElement);
            } else if (
                operateElement.type !== "video" &&
                operateElement.type !== "audio"
            ) {
                const newElement: Exclude<
                    IPPTElement,
                    IPPTLineElement | IPPTVideoElement | IPPTAudioElement
                > = {
                    ...operateElement,
                    outline: {
                        ...(operateElement.outline || {}),
                        ...outline
                    }
                };

                if (!outline) delete newElement.outline;

                newElements.push(newElement);
            }
        }
        this.executeUpdateRender(newElements, true);
    }

    // 复制
    public async executeCopy() {
        const operateElements = this._stageConfig.operateElements;
        // 选中文本框元素内容
        if (this._stageConfig.textFocus) {
            const selectArea = this._stageConfig.selectArea;
            if (selectArea) {
                const operateElement = operateElements.find(
                    (element) =>
                        element.id === this._stageConfig.textFocusElementId
                ) as IPPTTextElement | IPPTShapeElement | IPPTTableElement;
                const { startX, endX } = this._stageConfig.getSelectArea(
                    selectArea,
                    operateElement
                );
                let copyContent: IFontData[] = [];
                if (operateElement.type === "table") {
                    const tableSelectCells = this._stageConfig.tableSelectCells;
                    if (tableSelectCells) {
                        const startRow = tableSelectCells[0][0];
                        const startCol = tableSelectCells[0][1];
                        const endRow = tableSelectCells[1][0];
                        const endCol = tableSelectCells[1][1];
                        if (startRow === endRow && startCol === endCol) {
                            copyContent = operateElement.data[startRow][
                                startCol
                            ].content.slice(startX, endX);
                        }
                    }
                } else {
                    copyContent = operateElement.content.slice(startX, endX);
                }
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
                        operateElements
                    )}`
                )
            );
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
            const elements = pasteCustomClipboardString(
                resultText
            ) as IPPTElement[];

            for (const element of elements) {
                // 粘贴的内容为元素数据
                element.id = createRandomCode();
                // 新元素较旧元素偏移一段距离
                element.left += 10;
                element.top += 10;
            }

            this.executeAddRender(elements);

            // 再次写入剪切板，为了下一次粘贴能够在上一次的基础上进行偏移
            await copyText(
                encrypt(
                    `${CLIPBOARD_STRING_TYPE.ELEMENT}${JSON.stringify(
                        elements
                    )}`
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
                this.executeAddRender([element]);
            };
            image.src = content;
        } else if (content.indexOf(CLIPBOARD_STRING_TYPE.TEXT) > -1) {
            const resultText = content.replace(CLIPBOARD_STRING_TYPE.TEXT, "");
            const elementContent = pasteCustomClipboardString(
                resultText
            ) as IFontData[];
            if (this._stageConfig.textFocus) {
                const operateElements = this._stageConfig.operateElements;
                const operateElement = operateElements.find(
                    (element) =>
                        element.id === this._stageConfig.textFocusElementId
                );

                if (
                    operateElement &&
                    (operateElement.type === "text" ||
                        operateElement.type === "shape" ||
                        operateElement.type === "table")
                ) {
                    const selectArea = this._stageConfig.selectArea;
                    if (selectArea) {
                        // 选中区域存在替换选中区域
                        this._deleteSelectText();
                    }

                    // 光标位置粘贴
                    const position = this._cursor.getDataPosition();
                    if (operateElement.type === "table") {
                        const tableSelectCells =
                            this._stageConfig.tableSelectCells;
                        if (tableSelectCells) {
                            const startRow = tableSelectCells[0][0];
                            const startCol = tableSelectCells[0][1];
                            const endRow = tableSelectCells[1][0];
                            const endCol = tableSelectCells[1][1];
                            if (startRow === endRow && startCol === endCol) {
                                operateElement.data[startRow][
                                    startCol
                                ].content.splice(
                                    position + 1,
                                    0,
                                    ...elementContent
                                );
                            }
                        }
                    } else {
                        operateElement.content.splice(
                            position + 1,
                            0,
                            ...elementContent
                        );
                    }
                    if (operateElement.type === "text") {
                        operateElement.height =
                            this._stageConfig.getTextHeight(operateElement);
                    }
                    const cursorPosition = position + elementContent.length;
                    this.executeUpdateRender(operateElements, true);
                    this._updateCursor(cursorPosition);
                }
            } else {
                let contentWidth = TEXT_MARGIN * 2;
                const newElement = createTextElement({
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0
                });
                elementContent.forEach((text) => {
                    contentWidth += text.width + newElement.wordSpace;
                });
                newElement.content.splice(0, 0, ...elementContent);
                newElement.width = contentWidth;
                newElement.height = this._stageConfig.getTextHeight(newElement);
                this.executeAddRender([newElement]);
            }
        } else {
            // 普通外来文本
            // 这里考虑是否带格式，先处理不带格式的
            if (content) {
                if (this._stageConfig.textFocus) {
                    const operateElements = this._stageConfig.operateElements;
                    const operateElement = operateElements.find(
                        (element) =>
                            element.id === this._stageConfig.textFocusElementId
                    );
                    if (operateElement && operateElement.type === "text") {
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
                        operateElement.height =
                            this._stageConfig.getTextHeight(operateElement);
                        const cursorPosition = position + elementContent.length;
                        this.executeUpdateRender(operateElements, true);
                        this._updateCursor(cursorPosition);
                    }
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
                    newElement.height =
                        this._stageConfig.getTextHeight(newElement);
                    this.executeAddRender([newElement]);
                }
            }
        }
    }

    // 全选
    public executeSelectAll() {
        const slide = this._stageConfig.getCurrentSlide();
        this._stageConfig.updateOperateElements(slide?.elements || []);
        this.executeRender();
    }

    // 选中元素
    public executeSelectElements(elementIds: string[]) {
        const slide = this._stageConfig.getCurrentSlide();
        const selectedElements = slide?.elements.filter((element) =>
            elementIds.includes(element.id)
        );
        this._stageConfig.updateOperateElements(selectedElements || []);
        this.executeRender();
    }

    // 删除元素 或 删除文本
    public executeDelete(direction = 0) {
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
            const operateElements = this._stageConfig.operateElements;
            this.executeDeleteRender(operateElements);
        }
    }

    // 选中位置字体更新字体样式配置
    public executeUpdateFontConfig() {
        // 获取前一个字的样式，设置config
        if (this._stageConfig.textFocus) {
            const operateElements = this._stageConfig.operateElements;
            const operateElement = operateElements.find(
                (element) => element.id === this._stageConfig.textFocusElementId
            );
            if (operateElement && operateElement.type === "text") {
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
                    this._listener.onFontWeightChange(
                        config.fontWeight === "bold"
                    );
                this._listener.onFontStyleChange &&
                    this._listener.onFontStyleChange(
                        config.fontStyle === "italic"
                    );
                this._listener.onFontUnderLineChange &&
                    this._listener.onFontUnderLineChange(config.underline);
                this._listener.onFontStrikoutChange &&
                    this._listener.onFontStrikoutChange(config.strikout);
                this._listener.onFontFamilyChange &&
                    this._listener.onFontFamilyChange(config.fontFamily);
            }
        }
    }

    // 删除选中文本
    private _deleteSelectText() {
        const selectArea = this._stageConfig.selectArea;
        if (selectArea) {
            const operateElements = this._stageConfig.operateElements;
            const operateElement = operateElements.find(
                (element) => element.id === this._stageConfig.textFocusElementId
            );
            if (
                operateElement &&
                (operateElement.type === "text" ||
                    operateElement.type === "shape" ||
                    operateElement.type === "table")
            ) {
                const { startX, endX } = this._stageConfig.getSelectArea(
                    selectArea,
                    operateElement
                );
                if (operateElement.type === "table") {
                    const tableSelectCells = this._stageConfig.tableSelectCells;
                    if (tableSelectCells) {
                        const startRow = tableSelectCells[0][0];
                        const startCol = tableSelectCells[0][1];
                        const endRow = tableSelectCells[1][0];
                        const endCol = tableSelectCells[1][1];
                        if (startRow === endRow && startCol === endCol) {
                            operateElement.data[startRow][
                                startCol
                            ].content.splice(startX, endX - startX);
                        }
                    }
                } else {
                    operateElement.content.splice(startX, endX - startX);
                }

                if (operateElement.type === "text") {
                    operateElement.height =
                        this._stageConfig.getTextHeight(operateElement);
                }

                this._stageConfig.setSelectArea(null);

                this.executeUpdateRender(operateElements, true);

                this._updateCursor(startX - 1);
            }
        }
    }

    // 删除文本内容
    private _deleteText(position: number) {
        const operateElements = this._stageConfig.operateElements;
        const operateElement = operateElements.find(
            (element) => element.id === this._stageConfig.textFocusElementId
        );
        if (
            operateElement &&
            (operateElement.type === "text" ||
                operateElement.type === "shape" ||
                operateElement.type === "table")
        ) {
            if (operateElement.type === "table") {
                const tableSelectCells = this._stageConfig.tableSelectCells;
                if (tableSelectCells) {
                    const startRow = tableSelectCells[0][0];
                    const startCol = tableSelectCells[0][1];
                    const endRow = tableSelectCells[1][0];
                    const endCol = tableSelectCells[1][1];
                    if (startRow === endRow && startCol === endCol) {
                        const content = operateElement.data[startRow][startCol].content;
                        if (position >= content.length - 1 || position === -1) return false;
                        content.splice(position, 1);
                    }
                }
            } else {
                if (
                    position >= operateElement.content.length - 1 ||
                    position === -1
                ) return false;
                operateElement.content.splice(position, 1);
            }

            if (operateElement.type === "text") {
                operateElement.height =
                    this._stageConfig.getTextHeight(operateElement);
            }

            this.executeUpdateRender(operateElements);

            this._debounceLog();
            return true;
        }
        return false;
    }

    // 元素移动 及 光标移动
    public executeMove(direction: string) {
        const operateElements = this._stageConfig.operateElements;
        if (this._stageConfig.textFocus) {
            const operateElement = operateElements.find(
                (element) => element.id === this._stageConfig.textFocusElementId
            );
            if (
                operateElement &&
                (operateElement.type === "text" ||
                    operateElement.type === "shape" ||
                    operateElement.type === "table")
            ) {
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
            }
        } else {
            for (const operateElement of operateElements) {
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
            }

            this.executeUpdateRender(operateElements);

            this._debounceLog();
        }
    }

    // 回车键
    public executeEnter() {
        // 文本框编辑时回车
        if (this._stageConfig.textFocus) {
            const operateElements = this._stageConfig.operateElements;
            const operateElement = operateElements.find(
                (element) => element.id === this._stageConfig.textFocusElementId
            );
            if (
                operateElement &&
                (operateElement.type === "text" ||
                    operateElement.type === "shape" ||
                    operateElement.type === "table")
            ) {
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
    public executeAddRender(elements: IPPTElement[]) {
        for (const element of elements) {
            this._stageConfig.addElement(element);
        }

        this._stageConfig.updateOperateElements(elements);

        this.executeLogRender();
    }

    // 元素删除及渲染
    public executeDeleteRender(elements: IPPTElement[]) {
        const slide = this._stageConfig.getCurrentSlide();
        if (slide && slide.elements) {
            slide.elements = slide.elements.filter(
                (ele) =>
                    elements.findIndex((element) => element.id === ele.id) ===
                    -1
            );
            this._stageConfig.setOperateElement(null, false);

            this.executeLogRender();
        }
    }

    // 文本输入
    public executeAddText(text: IFontData, position: number) {
        const operateElements = this._stageConfig.operateElements;
        const operateElement = operateElements.find(
            (element) => element.id === this._stageConfig.textFocusElementId
        );
        if (
            operateElement &&
            (operateElement.type === "text" ||
                operateElement.type === "shape" ||
                operateElement.type === "table")
        ) {
            if (operateElement.type === "table") {
                if (
                    this._stageConfig.tableSelectCells &&
                    this._stageConfig.tableSelectCells.length > 0
                ) {
                    const row = this._stageConfig.tableSelectCells[0][0];
                    const col = this._stageConfig.tableSelectCells[0][1];
                    const tableCell = operateElement.data[row][col];
                    tableCell.content.splice(position, 0, text);
                }
            } else {
                operateElement.content.splice(position, 0, text);
            }
            if (operateElement.type === "text") {
                operateElement.height =
                    this._stageConfig.getTextHeight(operateElement);
            }

            const currentDate = new Date();
            if (this._addTextRenderThrottle) {
                if (
                    currentDate.getTime() -
                        this._addTextRenderThrottle.getTime() >=
                    100
                ) {
                    // 渲染过快导致重叠问题进行节流操作
                    this.executeUpdateRender(operateElements);
                    this._addTextRenderThrottle = currentDate;
                }
            } else {
                this.executeUpdateRender(operateElements);
                this._addTextRenderThrottle = currentDate;
            }

            this._debounceLog();
        }
    }

    // 循环选中文本
    private _forSelectTexts(
        element: IPPTTextElement | IPPTShapeElement | IPPTTableElement,
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

    private _setTextStyle(textStyle: Partial<ITextStyle>, type?: "plus" | "minus") {
        const operateElements = this._stageConfig.operateElements;
        const textFocus = this._stageConfig.textFocus;
        const textFocusElementId = this._stageConfig.textFocusElementId;
        const selectArea = this._stageConfig.selectArea;
        const tableSelectCells = this._stageConfig.tableSelectCells;

        if (textFocus) {
            const operateElement = operateElements.find(
                (element) => element.id === textFocusElementId
            );

            if (
                operateElement &&
                (operateElement.type === "text" ||
                    operateElement.type === "shape" ||
                    operateElement.type === "table")
            ) {
                let startRow = -1;
                let endRow = -1;
                let startCol = -1;
                let endCol = -1;

                if (tableSelectCells) {
                    startRow = Math.min(
                        tableSelectCells[0][0],
                        tableSelectCells[1][0]
                    );
                    endRow = Math.max(
                        tableSelectCells[0][0],
                        tableSelectCells[1][0]
                    );
                    startCol = Math.min(
                        tableSelectCells[0][1],
                        tableSelectCells[1][1]
                    );
                    endCol = Math.max(
                        tableSelectCells[0][1],
                        tableSelectCells[1][1]
                    );
                }

                if (
                    startRow !== -1 &&
                    !(startRow === endRow && startCol === endCol) &&
                    operateElement.type === "table"
                ) {
                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startCol; col <= endCol; col++) {
                            const tableCell = operateElement.data[row][col];
                            tableCell.content.forEach((text) => {
                                this._applyTextStyle(text, textStyle, type);
                            });
                        }
                    }
                } else if (selectArea) {
                    this._forSelectTexts(operateElement, selectArea, (text) => {
                        this._applyTextStyle(text, textStyle, type);
                    });

                    if (operateElement.type === "text") {
                        operateElement.height =
                            this._stageConfig.getTextHeight(operateElement);
                    }
                } else {
                    const config = this._stageConfig.fontConfig;
                    this._stageConfig.setFontConfig({
                        ...config,
                        ...textStyle
                    });
                }
            }
        } else {
            for (const operateElement of operateElements) {
                if (
                    operateElement.type === "text" ||
                    operateElement.type === "shape"
                ) {
                    operateElement.content.forEach((text) => {
                        this._applyTextStyle(text, textStyle, type);
                    });

                    if (operateElement.type === "text") {
                        operateElement.height =
                            this._stageConfig.getTextHeight(operateElement);
                    }
                } else if (operateElement.type === "table") {
                    operateElement.data.forEach((row) => {
                        row.forEach((col) => {
                            col.content.forEach((text) => {
                                this._applyTextStyle(text, textStyle, type);
                            });
                        });
                    });
                }
            }
        }

        this.executeUpdateRender(operateElements);
        this._debounceLog();
    }

    private _applyTextStyle(text: IFontData, textStyle: Partial<ITextStyle>, type?: "plus" | "minus") {
        text.fontSize = textStyle.fontSize !== undefined ? (!type ? textStyle.fontSize : type === "plus" ? text.fontSize + textStyle.fontSize : text.fontSize - textStyle.fontSize) : text.fontSize;
        text.fontWeight = textStyle.fontWeight !== undefined ? textStyle.fontWeight : text.fontWeight;
        text.fontStyle = textStyle.fontStyle !== undefined ? textStyle.fontStyle : text.fontStyle;
        text.underline = textStyle.underline !== undefined ? textStyle.underline : text.underline;
        text.strikout = textStyle.strikout !== undefined ? textStyle.strikout : text.strikout;
        text.fontColor = textStyle.fontColor !== undefined ? textStyle.fontColor : text.fontColor;
        text.fontFamily = textStyle.fontFamily !== undefined ? textStyle.fontFamily : text.fontFamily;
        this._resetTextFontSize(text);
    }

    // 设置文本字体大小
    public executeSetFontSize(fontSize: number, type?: "plus" | "minus") {
        this._setTextStyle({
            fontSize
        }, type);
    }

    // 设置字体粗细
    public executeSetFontWeight(bold: boolean) {
        this._setTextStyle({
            fontWeight: bold ? "bold" : "normal"
        });
    }

    // 设置字体斜体
    public executeSetFontStyle(italic: boolean) {
        this._setTextStyle({
            fontStyle: italic ? "italic" : "normal"
        });
    }

    // 设置字体下划线
    public executeSetFontUnderLine(underline: boolean) {
        this._setTextStyle({
            underline
        });
    }

    // 设置字体删除线
    public executeSetFontStrikout(strikout: boolean) {
        this._setTextStyle({
            strikout
        });
    }

    // 设置字体颜色
    public executeSetFontColor(fontColor: string) {
        this._setTextStyle({
            fontColor
        });
    }

    // 设置字体
    public executeSetFontFamily(fontFamily: string) {
        this._setTextStyle({
            fontFamily
        });
    }

    // 设置文本对齐方式
    public executeSetFontAlign(align: "left" | "center" | "right") {
        const operateElements = this._stageConfig.operateElements;

        for (const operateElement of operateElements) {
            if (
                operateElement &&
                (operateElement.type === "text" ||
                    operateElement.type === "shape" ||
                    operateElement.type === "table")
            ) {
                if (operateElement.type === "table") {
                    const tableSelectCells = this._stageConfig.tableSelectCells;
                    let startRow = -1;
                    let endRow = -1;
                    let startCol = -1;
                    let endCol = -1;
                    if (tableSelectCells) {
                        startRow = Math.min(
                            tableSelectCells[0][0],
                            tableSelectCells[1][0]
                        );
                        endRow = Math.max(
                            tableSelectCells[0][0],
                            tableSelectCells[1][0]
                        );
                        startCol = Math.min(
                            tableSelectCells[0][1],
                            tableSelectCells[1][1]
                        );
                        endCol = Math.max(
                            tableSelectCells[0][1],
                            tableSelectCells[1][1]
                        );

                        for (let row = startRow; row <= endRow; row++) {
                            for (let col = startCol; col <= endCol; col++) {
                                const tableCell = operateElement.data[row][col];
                                tableCell.align = align;
                            }
                        }
                    } else {
                        for (
                            let row = 0;
                            row < operateElement.data.length;
                            row++
                        ) {
                            for (
                                let col = 0;
                                col < operateElement.data[row].length;
                                col++
                            ) {
                                const tableCell = operateElement.data[row][col];
                                tableCell.align = align;
                            }
                        }
                    }
                } else {
                    operateElement.align = align;
                }
            }
        }

        if (operateElements.length > 0) {
            this.executeUpdateRender(operateElements, true);

            if (this._stageConfig.textFocus) {
                const position = this._cursor.getDataPosition();
                this._updateCursor(position);
            }
        }
    }

    // 设置文本行距
    public executeSetLineHeight(lineHeight: number) {
        const operateElements = this._stageConfig.operateElements;

        for (const operateElement of operateElements) {
            if (
                operateElement &&
                (operateElement.type === "text" ||
                    operateElement.type === "shape" ||
                    operateElement.type === "table")
            ) {
                if (operateElement.type === "table") {
                    const tableSelectCells = this._stageConfig.tableSelectCells;
                    let startRow = -1;
                    let endRow = -1;
                    let startCol = -1;
                    let endCol = -1;
                    if (tableSelectCells) {
                        startRow = Math.min(
                            tableSelectCells[0][0],
                            tableSelectCells[1][0]
                        );
                        endRow = Math.max(
                            tableSelectCells[0][0],
                            tableSelectCells[1][0]
                        );
                        startCol = Math.min(
                            tableSelectCells[0][1],
                            tableSelectCells[1][1]
                        );
                        endCol = Math.max(
                            tableSelectCells[0][1],
                            tableSelectCells[1][1]
                        );

                        for (let row = startRow; row <= endRow; row++) {
                            for (let col = startCol; col <= endCol; col++) {
                                const tableCell = operateElement.data[row][col];
                                tableCell.lineHeight = lineHeight;
                            }
                        }
                    } else {
                        for (
                            let row = 0;
                            row < operateElement.data.length;
                            row++
                        ) {
                            for (
                                let col = 0;
                                col < operateElement.data[row].length;
                                col++
                            ) {
                                const tableCell = operateElement.data[row][col];
                                tableCell.lineHeight = lineHeight;
                            }
                        }
                    }
                } else {
                    operateElement.lineHeight = lineHeight;
                    if (operateElement.type === "text") {
                        operateElement.height =
                            this._stageConfig.getTextHeight(operateElement);
                    }
                }
            }
        }

        if (operateElements.length > 0) this.executeUpdateRender(operateElements, true);
    }

    private _setElementAlign(
        operateElement: IPPTElement,
        align: IElementAlignType
    ) {
        const width =
            operateElement.type === "line"
                ? operateElement.end[0] - operateElement.start[0]
                : operateElement.width;
        const height =
            operateElement.type === "line"
                ? operateElement.end[1] - operateElement.start[1]
                : operateElement.height;
        switch (align) {
            case "alignLeft": {
                operateElement.left = 0;
                if (operateElement.type === "line" && operateElement.end[0] < 0) operateElement.left = -width;
                break;
            }
            case "alignCenter": {
                operateElement.left = (VIEWPORT_SIZE - width) / 2;
                break;
            }
            case "alignRight": {
                operateElement.left = VIEWPORT_SIZE - width;
                break;
            }
            case "center": {
                operateElement.left = (VIEWPORT_SIZE - width) / 2;
                operateElement.top = (VIEWPORT_SIZE * VIEWRATIO - height) / 2;
                break;
            }
            case "oneAlignCenter": {
                operateElement.left = (VIEWPORT_SIZE - width) / 2;
                break;
            }
            case "oneVerticalCenter": {
                operateElement.top = (VIEWPORT_SIZE * VIEWRATIO - height) / 2;
                break;
            }
            case "verticalTop": {
                operateElement.top = 0;
                if (operateElement.type === "line" && operateElement.end[1] < 0) operateElement.top = -height;
                break;
            }
            case "verticalCenter": {
                operateElement.top = (VIEWPORT_SIZE * VIEWRATIO - height) / 2;
                break;
            }
            case "verticalBottom": {
                operateElement.top = VIEWPORT_SIZE * VIEWRATIO - height;
                break;
            }
        }
        return operateElement;
    }

    private _setElementAlignByElement(
        operateElement: IPPTElement,
        align: IElementAlignType,
        boundary: number[]
    ) {
        const width =
            operateElement.type === "line"
                ? operateElement.end[0] - operateElement.start[0]
                : operateElement.width;
        const height =
            operateElement.type === "line"
                ? operateElement.end[1] - operateElement.start[1]
                : operateElement.height;
        const viewSizeWight = boundary[2] - boundary[0];
        const viewSizeHeight = boundary[3] - boundary[1];
        const elementBoundary =
            this._stageConfig.getElementBoundary(operateElement);
        switch (align) {
            case "alignLeft": {
                const offsetX = elementBoundary[0] - boundary[0];
                operateElement.left = operateElement.left - offsetX;
                break;
            }
            case "alignCenter": {
                operateElement.left = boundary[0] + (viewSizeWight - width) / 2;
                break;
            }
            case "alignRight": {
                operateElement.left = boundary[0] + viewSizeWight - width;
                break;
            }
            case "center": {
                operateElement.left = boundary[0] + (viewSizeWight - width) / 2;
                operateElement.top =
                    boundary[1] + (viewSizeHeight - height) / 2;
                break;
            }
            case "verticalTop": {
                const offsetY = elementBoundary[1] - boundary[1];
                operateElement.top = operateElement.top - offsetY;
                break;
            }
            case "verticalCenter": {
                operateElement.top =
                    boundary[1] + (viewSizeHeight - height) / 2;
                break;
            }
            case "verticalBottom": {
                operateElement.top = boundary[1] + viewSizeHeight - height;
                break;
            }
        }
        return operateElement;
    }

    // 设置元素对齐
    public executeSetElementAlign(align: IElementAlignType) {
        const operateElements = this._stageConfig.operateElements;
        const elements: IPPTElement[] = [];
        if (operateElements.length > 1) {
            // 相对于元素对齐
            const boundary =
                this._stageConfig.getOperateElementsBoundary(operateElements);
            for (const operateElement of operateElements) {
                const element = this._setElementAlignByElement(
                    operateElement,
                    align,
                    boundary
                );
                elements.push(element);
            }
        } else {
            for (const operateElement of operateElements) {
                const element = this._setElementAlign(operateElement, align);
                elements.push(element);
            }
        }

        if (operateElements.length > 0) this.executeUpdateRender(elements, true);
    }

    // 合并单元格
    public executeMergeCell() {
        const operateElement = this._stageConfig.operateElements.find(
            (element) => element.id === this._stageConfig.tableEditElementID
        ) as IPPTTableElement;
        if (operateElement) {
            const tableSelectCells = this._stageConfig.tableSelectCells;
            if (tableSelectCells) {
                const [start, end] = tableSelectCells;
                const startRow = Math.min(start[0], end[0]);
                const startCol = Math.min(start[1], end[1]);
                const endRow = Math.max(start[0], end[0]);
                const endCol = Math.max(start[1], end[1]);
                if (!(startRow === endRow && startCol === endCol)) {
                    const tableData = operateElement.data;
                    const tableCell = tableData[startRow][startCol];
                    tableCell.colspan = endCol - startCol + 1;
                    tableCell.rowspan = endRow - startRow + 1;
                    for (let i = startRow; i <= endRow; i++) {
                        for (let j = startCol; j <= endCol; j++) {
                            if (i === startRow && j !== startCol) {
                                tableData[i][j].colspan = 0;
                                tableData[i][j].rowspan = 1;
                            } else if (i !== startRow) {
                                tableData[i][j].colspan = 1;
                                tableData[i][j].rowspan = 0;
                            }
                        }
                    }
                    this.executeUpdateRender([operateElement], true);

                    this._stageConfig.tableSelectCells = [
                        [startRow, startCol],
                        [startRow, startCol]
                    ];
                    this._listener.onTableCellEditChange &&
                        this._listener.onTableCellEditChange(true, false);
                }
            }
        }
    }

    // 拆分单元格
    public executeSplitCell() {
        const operateElement = this._stageConfig.operateElements.find(
            (element) => element.id === this._stageConfig.tableEditElementID
        ) as IPPTTableElement;
        if (operateElement) {
            const tableSelectCells = this._stageConfig.tableSelectCells;
            if (tableSelectCells) {
                const [start, end] = tableSelectCells;
                const [startRow, startCol] = start;
                const [endRow, endCol] = end;
                if (startRow === endRow && startCol === endCol) {
                    const tableData = operateElement.data;
                    const tableCell = tableData[startRow][startCol];
                    const colspan = tableCell.colspan;
                    const rowspan = tableCell.rowspan;
                    if (colspan > 1 || rowspan > 1) {
                        for (let i = startRow; i <= startRow + rowspan; i++) {
                            for (
                                let j = startCol;
                                j <= startCol + colspan;
                                j++
                            ) {
                                tableData[i][j].colspan = 1;
                                tableData[i][j].rowspan = 1;
                            }
                        }
                        this.executeUpdateRender([operateElement], true);
                        this._listener.onTableCellEditChange &&
                            this._listener.onTableCellEditChange(true, true);
                    }
                }
            }
        }
    }

    // 设置表格主题色
    public executeSetTableTheme(theme: Partial<IPPTTableTheme>) {
        const operateElements = this._stageConfig.operateElements;

        if (operateElements.length > 0) {
            for (const operateElement of operateElements) {
                if (operateElement.type === "table") {
                    const element = operateElement as IPPTTableElement;
                    if (theme.color) {
                        element.theme.color = theme.color;
                        // 清除单元格填充色
                        for (const row of element.data) {
                            for (const cell of row) {
                                cell.fill = undefined;
                            }
                        }
                    }
                    if ("rowHeader" in theme) {
                        element.theme.rowHeader = !!theme.rowHeader;
                    }
                }
            }

            this.executeUpdateRender(operateElements, true);
        }
    }

    // 表格插入行
    public executeInsertRow(rowIndex: number) {
        const operateElement = this._stageConfig.operateElements.find(
            (element) => element.id === this._stageConfig.tableEditElementID
        ) as IPPTTableElement;
        if (operateElement) {
            const tableData = operateElement.data;
            const newRow: IPPTTableCell[] = tableData[rowIndex].map(() => {
                return {
                    id: createRandomCode(),
                    colspan: 1,
                    rowspan: 1,
                    content: [],
                    wordSpace: 1,
                    lineHeight: 1.2,
                    align: "center"
                };
            });
            const rowHeights = operateElement.rowHeights.map(
                (item) => item * operateElement.height
            );
            operateElement.height += 60;
            rowHeights.splice(rowIndex, 0, 60);
            tableData.splice(rowIndex, 0, newRow);
            operateElement.rowHeights = rowHeights.map(
                (item) => item / operateElement.height
            );
            this.executeUpdateRender([operateElement], true);
        }
    }

    // 表格插入列
    public executeInsertCol(colIndex: number) {
        const operateElement = this._stageConfig.operateElements.find(
            (element) => element.id === this._stageConfig.tableEditElementID
        ) as IPPTTableElement;
        if (operateElement) {
            const tableData = operateElement.data;
            const colWidths = operateElement.colWidths.map(
                (item) => item * operateElement.width
            );
            operateElement.width += 120;
            colWidths.splice(colIndex, 0, 120);
            operateElement.colWidths = colWidths.map(
                (item) => item / operateElement.width
            );
            for (const row of tableData) {
                row.splice(colIndex, 0, {
                    id: createRandomCode(),
                    colspan: 1,
                    rowspan: 1,
                    content: [],
                    wordSpace: 1,
                    lineHeight: 1.2,
                    align: "center"
                });
            }
            this.executeUpdateRender([operateElement], true);
        }
    }

    // 表格删除行
    public executeDeleteRow(rowIndex: number) {
        const operateElement = this._stageConfig.operateElements.find(
            (element) => element.id === this._stageConfig.tableEditElementID
        ) as IPPTTableElement;
        if (operateElement) {
            const tableData = operateElement.data;
            const rowHeights = operateElement.rowHeights.map(
                (item) => item * operateElement.height
            );
            operateElement.height -= rowHeights[rowIndex];
            rowHeights.splice(rowIndex, 1);
            tableData.splice(rowIndex, 1);
            operateElement.rowHeights = rowHeights.map(
                (item) => item / operateElement.height
            );
            this.executeUpdateRender([operateElement], true);
        }
    }

    // 表格删除列
    public executeDeleteCol(colIndex: number) {
        const operateElement = this._stageConfig.operateElements.find(
            (element) => element.id === this._stageConfig.tableEditElementID
        ) as IPPTTableElement;
        if (operateElement) {
            const tableData = operateElement.data;
            const colWidths = operateElement.colWidths.map(
                (item) => item * operateElement.width
            );
            operateElement.width -= colWidths[colIndex];
            colWidths.splice(colIndex, 1);
            operateElement.colWidths = colWidths.map(
                (item) => item / operateElement.width
            );
            for (const row of tableData) {
                row.splice(colIndex, 1);
            }
            this.executeUpdateRender([operateElement], true);
        }
    }

    // 预览动画
    public executePreviewAnimation(ani?: IPPTAnimation) {
        if (ani) {
            // 预览某个元素动画
        } else {
            // 预览所有动画
        }
    }

    // 删除动画
    public executeDeleteAnimation(ani?: IPPTAnimation) {
        if (ani) {
            // 删除某个元素动画
            const animations = this._stageConfig.getAnimations();
            const newAnimations = animations.filter(
                (item) => item.id !== ani.id
            );
            this._stageConfig.setAnimations(newAnimations);
        } else {
            // 删除所有动画
            this._stageConfig.setAnimations([]);
        }

        this._listener.onAnimationsChange &&
            this._listener.onAnimationsChange();
        this._history.add();
    }

    // 新增动画
    public executeAddAnimation(anis: IPPTAnimation[]) {
        const animations = this._stageConfig.getAnimations();
        const newAnimations = animations.concat(anis);
        this._stageConfig.setAnimations(newAnimations);

        this._listener.onAnimationsChange &&
            this._listener.onAnimationsChange();
        this._history.add();
    }

    // 编辑动画
    public executeEditAnimation(anis: IPPTAnimation[]) {
        this._stageConfig.setAnimations(anis);

        this._listener.onAnimationsChange &&
            this._listener.onAnimationsChange();
        this._debounceLog();
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
