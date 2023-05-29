import Stage from ".";
import StageConfig, { TEXT_MARGIN } from "./config";
import { throttleRAF, deepClone, normalizeAngle, isFullScreen, getVideoElementControlPoints, getTableElementControlPoints } from "@/utils";
import Command from "../command";
import {
    createLineElement,
    createShapeElement,
    createTextElement
} from "@/utils/create";
import {
    IPPTElement,
    IPPTLineElement,
    IPPTShapeElement,
    IPPTTableElement,
    IPPTTextElement,
    IPPTVideoElement
} from "@/types/element";
import { ELEMENT_RESIZE, THEME_COLOR } from "../config/stage";
import { IElementOptions, IMouseClick, IRectParameter, IRects } from "@/types";
import { LINE_TYPE } from "../config/shapes";
import Listener from "../listener";
import { Text } from "./text";
import { Cursor } from "./cursor";
import { Textarea } from "./textarea";
import { IFontData } from "@/types/font";
import { Contextmenu } from "./contextmenu";
import emitter, { EmitterEvents } from "@/utils/emitter";
import History from "../editor/history";

export default class ControlStage extends Stage {
    private _command: Command;
    private _listener: Listener;
    private _canMoveCanvas: boolean;
    private _canCreate: boolean;
    private _canMoveElement: boolean;
    private _canResizeElement: boolean;
    private _startPoint: [number, number];
    private _startOriginPoint: [number, number];
    private _operateCacheElements: IPPTElement[];
    private _operateRisizeElementId: string;
    private _startAngle: number;
    private _storeAngle: number;
    private _text: Text;
    private _cursor: Cursor;
    private _textarea: Textarea;
    private _contextmenu: Contextmenu;
    private _textClick: IMouseClick | null;
    private _debounceSelectArea: null | number | NodeJS.Timeout;
    private _videoControlType = "";
    private _videoElement: IPPTVideoElement | null = null;
    private _tableControlType: [string, "ROWS" | "COLS", number] | null = null;
    private _operateTableControlType: [string, "ROWS" | "COLS", number] | null = null;
    private _operateTableCell = false;
    constructor(
        container: HTMLDivElement,
        stageConfig: StageConfig,
        history: History,
        command: Command,
        cursor: Cursor,
        textarea: Textarea,
        listener: Listener
    ) {
        super(container, stageConfig, history);

        this._canMoveCanvas = false;
        this._canCreate = false;
        this._canMoveElement = false;
        this._canResizeElement = false;
        this._startPoint = [0, 0];
        this._startOriginPoint = [0, 0];
        this._startAngle = 0;
        this._storeAngle = 0;
        this._operateCacheElements = [];
        this._operateRisizeElementId = "";

        this._command = command;
        this._cursor = cursor;
        this._textarea = textarea;
        this._listener = listener;
        this._textClick = null;
        // 文本框
        this._text = new Text(
            this.ctx,
            stageConfig,
            command,
            this._textarea,
            this._cursor
        );

        this._contextmenu = new Contextmenu(this._command, this.stageConfig);

        this._debounceSelectArea = null;
        // 后面考虑要不要改成window ？？？？？？？？？？？？？？？？？？？？？？
        this.container.addEventListener(
            "mousewheel",
            throttleRAF(this._mousewheel.bind(this) as (evt: Event) => void),
            false
        );
        this.container.addEventListener(
            "contextmenu",
            this._onContextmenu.bind(this),
            false
        );
        this.container.addEventListener(
            "mousedown",
            this._mousedown.bind(this),
            false
        );
        this.container.addEventListener(
            "dblclick",
            this._dblClick.bind(this),
            false
        );
        this.container.addEventListener(
            "mousemove",
            throttleRAF(this._mousemove.bind(this)),
            false
        );
        this.container.addEventListener(
            "mouseup",
            this._mouseup.bind(this),
            false
        );
        this.container.addEventListener(
            "mouseleave",
            this._mouseLeave.bind(this),
            false
        );
        window.addEventListener("resize", () => {
            if (!isFullScreen()) {
                this._exitFullScreen();
            }
        });
    }

    private _dblClick(evt: MouseEvent) {
        const { left, top } = this.stageConfig.getMousePosition(evt);
        const currentSlide = this.stageConfig.getCurrentSlide();
        const operateElement = this.stageConfig.getMouseInElement(
            left,
            top,
            this.ctx,
            currentSlide?.elements || []
        );
        if (operateElement) {
            if (operateElement.type === "text" || operateElement.type === "shape") {
                // 点击位置坐标
                const { left, top } = this.stageConfig.getMousePosition(evt);
                // 当元素被选中，且被双击时，开启编辑
                this.stageConfig.textFocus = true;
                this.stageConfig.textFocusElementId = operateElement.id;
                this.container.style.cursor = "text";

                let offsetY = 0;
                if (operateElement.type === "shape") {
                    const height = this.stageConfig.getTextHeight(operateElement);
                    offsetY = operateElement.height / 2 - height / 2;
                }

                // 聚焦光标到点击位置
                this._cursor.focus(
                    left - operateElement.left,
                    top - operateElement.top,
                    offsetY
                );

                this._command.executeUpdateFontConfig();
            }

            if (operateElement.type === "table") {
                this.stageConfig.tableEditElementID = operateElement.id;
                this.container.style.cursor = "text";
            }

            if (operateElement.type === "latex") {
                emitter.emit(EmitterEvents.OPEN_LATEX, operateElement);
            }

            if (operateElement.type === "chart") {
                emitter.emit(EmitterEvents.OPEN_CHART, { args: operateElement });
            }
        }
    }

    private _onContextmenu(evt: MouseEvent) {
        this._mousedown(evt, true);
        this._contextmenu.create(evt);
    }

    private _mousewheel(evt: WheelEvent) {
        if (evt.ctrlKey || evt.metaKey) {
            if (evt.deltaY > 0) {
                this._command.executeDecrease();
            } else {
                this._command.executeIncrease();
            }
        }
    }

    private _enterFullScreen(element: IPPTVideoElement) {
        this._videoElement = element;
        const video = document.getElementById(element.id) as HTMLVideoElement;
        video.classList.add("full-screen-video");
        video.requestFullscreen();
        video.controls = true;
    }

    private _exitFullScreen() {
        if (!this._videoElement) return;
        const element = this._videoElement;
        this._videoElement = null;
        const video = document.getElementById(element.id) as HTMLVideoElement;
        if (!video) return;
        video.classList.remove("full-screen-video");
        video.controls = false;
    }

    private _mousedown(evt: MouseEvent, isContextmenu?: boolean) {
        this._canMoveCanvas = !this.stageConfig.insertElement;
        this._canCreate = !!this.stageConfig.insertElement;
        this._startPoint = [evt.pageX, evt.pageY];
        const { left, top } = this.stageConfig.getMousePosition(evt);
        this._startOriginPoint = [left, top];

        if (this._videoControlType) {
            const currentSlide = this.stageConfig.getCurrentSlide();
            const hoverElement = this.stageConfig.getMouseInElement(
                left,
                top,
                this.ctx,
                currentSlide?.elements || []
            ) as IPPTVideoElement;
            if (hoverElement) {
                const video = document.getElementById(hoverElement.id) as HTMLVideoElement;
                // 视频实际操作
                if (this._videoControlType === "PLAY_PAUSE_BTN") {
                    // 播放与暂停
                    if (video.paused) {
                        video.play();
                        video.onended = () => this.stageConfig.stopVideoRender();
                        video.onpause = () => this.stageConfig.stopVideoRender();
                        this.stageConfig.startVideoRender();
                    } else {
                        video.pause();
                        this.stageConfig.stopVideoRender();
                    }
                } else if (this._videoControlType === "PROGRESS_LINE") {
                    // 进度条
                    const progress = (left - hoverElement.left - 15) / (hoverElement.width - 30);
                    video.currentTime = video.duration * progress;
                    setTimeout(() => {
                        if (video.paused) this.stageConfig.resetCheckDrawView();
                    }, 100);
                } else if (this._videoControlType === "FULLSCREEN_BTN") {
                    // 全屏
                    this._enterFullScreen(hoverElement);
                }
            }
            return;
        }

        if (this._tableControlType) {
            this._operateTableControlType = this._tableControlType;
            return;
        }

        if (this.stageConfig.tableEditElementID) {
            const currentSlide = this.stageConfig.getCurrentSlide();
            const hoverElement = this.stageConfig.getMouseInElement(
                left,
                top,
                this.ctx,
                currentSlide?.elements || []
            ) as IPPTTableElement;
            if (hoverElement && hoverElement.id === this.stageConfig.tableEditElementID) {
                if (isContextmenu || evt.button === 2) return;
                const { row, col } = this.stageConfig.getMouseTableCell(hoverElement, left, top);
                this.stageConfig.tableSelectCells = [[row, col], [row, col]];
                const tableCell = hoverElement.data[row][col];
                this._listener.onTableCellEditChange && this._listener.onTableCellEditChange(true, tableCell.colspan === 1 && tableCell.rowspan === 1);
                this._command.executeRender();
                this._operateTableCell = true;
                return;
            }
        }

        if (!this.stageConfig.insertElement && !this.stageConfig.canMove) {
            if (
                this.stageConfig.opreateType &&
                this.stageConfig.operateElements.length > 0 &&
                !this._canResizeElement
            ) {
                // resize rotate操作
                this._canResizeElement = true;
                const elements = this.stageConfig.operateElements;
                const element = elements.find(operateElement => operateElement.id === this._operateRisizeElementId);
                if (
                    element &&
                    element.type !== "line" &&
                    this.stageConfig.opreateType === "ANGLE"
                ) {
                    // 旋转
                    const cx = element.left + element.width / 2;
                    const cy = element.top + element.height / 2;

                    this._startAngle = Math.atan2(top - cy, left - cx);
                    this._storeAngle = (element.rotate / 180) * Math.PI;
                }

                this._operateCacheElements = deepClone(elements);
                this._cursor.hideCursor();
            } else {
                const currentSlide = this.stageConfig.getCurrentSlide();
                const operateElement = this.stageConfig.getMouseInElement(
                    left,
                    top,
                    this.ctx,
                    currentSlide?.elements || []
                );

                // 右击菜单会触发mousedown事件，这里延迟取消文本选中
                if (isContextmenu && this._debounceSelectArea) {
                    clearTimeout(this._debounceSelectArea);
                }
                if (!isContextmenu) {
                    this._debounceSelectArea = setTimeout(() => {
                        this.stageConfig.setSelectArea(null);
                    }, 20);
                }
                // this.stageConfig.setSelectArea(null);

                // 存在已选中，重复选中不执行下面操作
                if (
                    operateElement &&
                    this.stageConfig.operateElements.length > 0 &&
                    this.stageConfig.operateElements.findIndex(element => element.id === operateElement.id) > -1
                ) {
                    if (this.stageConfig.textFocus && operateElement.id === this.stageConfig.textFocusElementId) {
                        if (!isContextmenu) this._cursor.hideCursor();
                        const x = left - operateElement.left;
                        let y = top - operateElement.top;
                        const renderContent = this.stageConfig.getRenderContent(
                            operateElement as (IPPTTextElement | IPPTShapeElement)
                        );

                        if (operateElement.type === "shape") {
                            const height = this.stageConfig.getTextHeight(operateElement);
                            const offsetY = operateElement.height / 2 - height / 2;
                            if (y < offsetY) {
                                y = 4;
                            } else {
                                y = y - offsetY;
                            }
                        }

                        const { textX, textY } = this._cursor.getCursorPosition(
                            x,
                            y,
                            renderContent
                        );
                        this._textClick = {
                            x,
                            y,
                            textX: textX + 1,
                            textY
                        };
                        return;
                    }
                    this.stageConfig.textFocus = false;
                    this.stageConfig.textFocusElementId = "";
                    this._cursor.hideCursor();
                    this._canMoveElement = true;
                    if (!(evt.ctrlKey || evt.shiftKey || evt.metaKey)) return;
                }

                this.stageConfig.setOperateElement(operateElement, evt.ctrlKey || evt.shiftKey || evt.metaKey);
                this.stageConfig.resetCheckDrawView();
                this.stageConfig.tableEditElementID = "";
                this.stageConfig.tableSelectCells = null;
                if (operateElement) {
                    this._cursor.hideCursor();
                    this.stageConfig.textFocus = false;
                    this.stageConfig.textFocusElementId = "";
                    this.resetDrawOprate();
                    this._canMoveElement = true;
                } else {
                    this._canMoveElement = false;
                    this.clear();
                }
            }
        }
    }

    private _moveElements(evt: MouseEvent, operateElements: IPPTElement[]) {
        const zoom = this.stageConfig.zoom;
        const moveX = (evt.pageX - this._startPoint[0]) / zoom;
        const moveY = (evt.pageY - this._startPoint[1]) / zoom;

        const elements: IPPTElement[] = [];
        for (const operateElement of operateElements) {
            const newElement = {
                ...operateElement,
                left: operateElement.left + moveX,
                top: operateElement.top + moveY
            };

            elements.push(newElement);
        }

        this._command.executeUpdateRender(elements);
        this._startPoint = [evt.pageX, evt.pageY];
    }

    private _resizeElements(evt: MouseEvent, opreateElements: IPPTElement[]) {
        const elements: IPPTElement[] = [];
        for (const operateElement of opreateElements) {
            if (operateElement.type !== "line") {
                // 旋转缩放元素
                if (this.stageConfig.opreateType === "ANGLE") {
                    // 旋转
                    const element = opreateElements.find(ele => ele.id === this._operateRisizeElementId) as Exclude<IPPTElement, IPPTLineElement> | undefined;
                    if (element) {
                        const cx = element.left + element.width / 2;
                        const cy = element.top + element.height / 2;

                        const { left, top } = this.stageConfig.getMousePosition(evt);
                        const currentAngle = Math.atan2(top - cy, left - cx);

                        const changeAngle = currentAngle - this._startAngle;
                        const angle = normalizeAngle(
                            changeAngle + this._storeAngle
                        );

                        const newElement = {
                            ...operateElement,
                            rotate: angle
                        };

                        elements.push(newElement);
                    }
                } else {
                    // 缩放
                    // const element = this.stageConfig.operateElement;
                    const originElement = this._operateCacheElements.find(element => element.id === operateElement.id);
                    if (originElement && originElement.type !== "line") {
                        const { left, top } = this.stageConfig.getMousePosition(evt);
                        const storeData = {
                            ofx: 0,
                            ofy: 0,
                            width: originElement.width,
                            height: originElement.height
                        };

                        const resizeBottom = /BOTTOM/.test(
                            this.stageConfig.opreateType
                        );
                        const resizeTop = /TOP/.test(
                            this.stageConfig.opreateType
                        );
                        const resizeLeft = /LEFT/.test(
                            this.stageConfig.opreateType
                        );
                        const resizeRight = /RIGHT/.test(
                            this.stageConfig.opreateType
                        );

                        const cx = originElement.left + originElement.width / 2;
                        const cy = originElement.top + originElement.height / 2;

                        const originLeft = originElement.left;
                        const originTop = originElement.top;

                        const startOriginX = this._startOriginPoint[0];
                        const startOriginY = this._startOriginPoint[1];

                        // 矩形位置坐标点旋转
                        const angle = (originElement.rotate / 180) * Math.PI;
                        let [rx, ry] = this.stageConfig.rotate(
                            originLeft,
                            originTop,
                            cx,
                            cy,
                            angle
                        );

                        if (resizeLeft || resizeRight) {
                            const { ofx, ofy, width } = this._horizontalZoom(
                                left,
                                top,
                                startOriginX,
                                startOriginY,
                                resizeLeft ? -1 : 1,
                                originElement
                            );

                            storeData.width = width;
                            storeData.ofx = storeData.ofx + ofx;
                            storeData.ofy = storeData.ofy + ofy;

                            if (resizeLeft) {
                                rx = rx + ofx;
                                ry = ry + ofy;
                            }
                        }

                        if (resizeTop || resizeBottom) {
                            const { ofx, ofy, height } = this._verticalZoom(
                                left,
                                top,
                                startOriginX,
                                startOriginY,
                                resizeTop ? -1 : 1,
                                originElement
                            );

                            storeData.height = height;
                            storeData.ofx = storeData.ofx + ofx;
                            storeData.ofy = storeData.ofy + ofy;

                            if (resizeTop) {
                                rx = rx + ofx;
                                ry = ry + ofy;
                            }
                        }

                        // 变化后的中心点
                        const changeCX = cx + storeData.ofx / 2;
                        const changeCY = cy + storeData.ofy / 2;

                        // 矩形位置坐标点往回旋转
                        const [ox, oy] = this.stageConfig.rotate(
                            rx,
                            ry,
                            changeCX,
                            changeCY,
                            -angle
                        );

                        // 限制缩放的最小值
                        if (storeData.width > 0 && storeData.height > 0) {
                            const newElement = {
                                ...originElement,
                                width: storeData.width,
                                height: storeData.height,
                                left: ox,
                                top: oy
                            };

                            elements.push(newElement);
                        }
                    }
                }
            } else if (operateElement.type === "line") {
                const { left, top } = this.stageConfig.getMousePosition(evt);
                // 线条控制
                if (this.stageConfig.opreateType === "START") {
                    const newElement: IPPTElement = {
                        ...operateElement,
                        left,
                        top,
                        end: [
                            operateElement.left - left + operateElement.end[0],
                            operateElement.top - top + operateElement.end[1]
                        ]
                    };

                    elements.push(newElement);
                } else if (this.stageConfig.opreateType === "END") {
                    const newElement: IPPTElement = {
                        ...operateElement,
                        end: [
                            left - operateElement.left,
                            top - operateElement.top
                        ]
                    };

                    elements.push(newElement);
                }
            }
        }

        if (elements.length > 0) this._command.executeUpdateRender(elements);
    }

    private _hoverCursor(evt: MouseEvent, operateElements: IPPTElement[]) {
        const { left, top } = this.stageConfig.getMousePosition(evt);
        this.stageConfig.setOperateType("");
        this._videoControlType = "";

        for (const operateElement of operateElements) {
            const zoom = this.stageConfig.zoom;
            if (operateElement.type === "line") {
                const dashWidth = 8 / zoom;

                const rects: IRects = this._getElementLinePoints(
                    operateElement.left,
                    operateElement.top,
                    operateElement.end,
                    dashWidth
                );

                for (const key in rects) {
                    if (
                        this.stageConfig.checkPointInRect(
                            left,
                            top,
                            rects[key],
                            left,
                            top,
                            0
                        )
                    ) {
                        this.stageConfig.setOperateType(key);
                        break;
                    }
                }

                if (this.stageConfig.opreateType) {
                    this.container.style.cursor = (ELEMENT_RESIZE as IElementOptions)[
                        this.stageConfig.opreateType
                    ] || "default";
                }
            } else {
                // 鼠标悬浮到操作区域展示形式
                const margin = 1;
                const offsetX = -operateElement.width / 2 - margin;
                const offsetY = -operateElement.height / 2 - margin;

                const dashedLinePadding = 0 + margin / zoom;
                const dashWidth = 8 / zoom;

                const rects: IRects = this._getElementResizePoints(
                    offsetX,
                    offsetY,
                    operateElement.width + margin * 2,
                    operateElement.height + margin * 2,
                    dashedLinePadding,
                    dashWidth
                );

                const cx = operateElement.left + operateElement.width / 2;
                const cy = operateElement.top + operateElement.height / 2;

                for (const key in rects) {
                    const rect: IRectParameter = [
                        rects[key][0] + cx,
                        rects[key][1] + cy,
                        rects[key][2],
                        rects[key][3]
                    ];
                    if (
                        this.stageConfig.checkPointInRect(
                            left,
                            top,
                            rect,
                            cx,
                            cy,
                            (operateElement.rotate / 180) * Math.PI
                        )
                    ) {
                        this._operateRisizeElementId = operateElement.id;
                        this.stageConfig.setOperateType(key);
                        break;
                    }
                }

                // 考虑结合旋转角度来改变优化cursor ？？？？？？？？？？？？？？？？？？？？
                if (this.stageConfig.opreateType) {
                    this.container.style.cursor = (ELEMENT_RESIZE as IElementOptions)[
                        this.stageConfig.opreateType
                    ] || "default";
                }
            }

            if (
                (operateElement.type === "text" || operateElement.type === "shape") &&
                operateElement.id === this.stageConfig.textFocusElementId &&
                this.stageConfig.textFocus
            ) {
                // 文本选中状态
                if (this._textClick) {
                    const { left, top } = this.stageConfig.getMousePosition(evt);
                    const x = left - operateElement.left;
                    let y = top - operateElement.top;
                    const renderContent = this.stageConfig.getRenderContent(
                        operateElement as (IPPTTextElement | IPPTShapeElement)
                    );

                    if (operateElement.type === "shape") {
                        const height = this.stageConfig.getTextHeight(operateElement);
                        const offsetY = operateElement.height / 2 - height / 2;
                        if (y < offsetY) {
                            y = 4;
                        } else {
                            y -= offsetY;
                        }
                    }

                    const { textX, textY } = this._cursor.getCursorPosition(
                        x,
                        y,
                        renderContent
                    );
                    let startX = this._textClick.textX;
                    let startY = this._textClick.textY;
                    let endX = textX + 1;
                    let endY = textY;
                    if (endY < startY) {
                        endX = this._textClick.textX;
                        endY = this._textClick.textY;
                        startX = textX + 1;
                        startY = textY;
                    } else if (endY === startY && startX > endX) {
                        endX = this._textClick.textX;
                        startX = textX + 1;
                    }

                    this.stageConfig.setSelectArea([
                        startX,
                        startY,
                        endX,
                        endY
                    ]);
                    this.resetDrawOprate();
                }
            }
        }

        if (!this.stageConfig.opreateType) {
            const currentSlide = this.stageConfig.getCurrentSlide();
            const hoverElement = this.stageConfig.getMouseInElement(
                left,
                top,
                this.ctx,
                currentSlide?.elements || []
            );

            if (hoverElement) {
                for (const operateElement of operateElements) {
                    if (
                        operateElement &&
                        (hoverElement.type === "text" || hoverElement.type === "shape") &&
                        hoverElement.id === operateElement.id &&
                        hoverElement.id === this.stageConfig.textFocusElementId &&
                        this.stageConfig.textFocus
                    ) {
                        if (this.container.style.cursor !== "text") {
                            this.container.style.cursor = "text";
                        }
                        break;
                    } else {
                        this.container.style.cursor = "move";
                    }
                }

                if (this.container.style.cursor !== "text" && this.container.style.cursor !== "move") {
                    this.container.style.cursor = "move";
                }

                if (hoverElement.type === "video") {
                    // 当元素是视频时，区分播放按钮 全屏按钮 进度条 悬浮状态
                    const rects: IRects = getVideoElementControlPoints(
                        hoverElement.left,
                        hoverElement.top,
                        hoverElement.width,
                        hoverElement.height
                    );

                    const cx = hoverElement.left + hoverElement.width / 2;
                    const cy = hoverElement.top + hoverElement.height / 2;

                    for (const key in rects) {
                        if (
                            this.stageConfig.checkPointInRect(
                                left,
                                top,
                                rects[key],
                                cx,
                                cy,
                                (hoverElement.rotate / 180) * Math.PI
                            )
                        ) {
                            this.container.style.cursor = "pointer";
                            this._videoControlType = key;
                            break;
                        }
                    }
                }

                if (
                    hoverElement.type === "table" &&
                    this.stageConfig.tableEditElementID === hoverElement.id
                ) {
                    this.container.style.cursor = "text";
                }

                if (
                    hoverElement.type === "table" &&
                    operateElements.find((item) => item.id === hoverElement.id) &&
                    !this._operateTableControlType
                ) {
                    this._tableControlType = null;

                    // 当元素是表格时，区分单元格 悬浮状态
                    const tableRect: {
                        ROWS: IRectParameter[];
                        COLS: IRectParameter[];
                    } = getTableElementControlPoints(
                        hoverElement.left,
                        hoverElement.top,
                        hoverElement.width,
                        hoverElement.height,
                        hoverElement.rowHeights,
                        hoverElement.colWidths
                    );

                    const cx = hoverElement.left + hoverElement.width / 2;
                    const cy = hoverElement.top + hoverElement.height / 2;

                    for (const key in tableRect) {
                        const rects: IRectParameter[] = tableRect[key];

                        for (const [index, rect] of rects.entries()) {
                            if (
                                this.stageConfig.checkPointInRect(
                                    left,
                                    top,
                                    rect,
                                    cx,
                                    cy,
                                    (hoverElement.rotate / 180) * Math.PI
                                )
                            ) {
                                this.container.style.cursor = key === "COLS" ? "col-resize" : "row-resize";
                                this._tableControlType = [hoverElement.id, key as "ROWS" | "COLS", index];
                                break;
                            }
                        }
                    }
                } else if (this._operateTableControlType) {
                    const key = this._operateTableControlType[1];
                    this.container.style.cursor = key === "COLS" ? "col-resize" : "row-resize";
                }
            } else {
                if (this.container.style.cursor !== "default") {
                    this.container.style.cursor = "default";
                }
            }
        }
    }

    private _resizeTable(evt: MouseEvent, operateElements: IPPTElement[]) {
        if (operateElements.length > 0 && this._operateTableControlType) {
            const operateElementId = this._operateTableControlType[0];
            const operateElement = operateElements.find((item) => item.id === operateElementId);
            if (operateElement && operateElement.type === "table") {
                const type = this._operateTableControlType[1];
                const element = deepClone(operateElement);
                if (type === "ROWS") {
                    // 拖动行
                    const pageY = evt.pageY;
                    const startOriginY = this._startPoint[1];
                    const moveY = pageY - startOriginY;
                    // 拖拽的行索引
                    const rowIndex = this._operateTableControlType[2];
                    const rowHeights = element.rowHeights.map((item) => item * element.height);
                    const currentHeight = rowHeights[rowIndex] + moveY;
                    element.height = element.height + moveY;
                    // 最小高度限定！！！！
                    if (currentHeight > 20) {
                        rowHeights[rowIndex] = currentHeight;
                        element.rowHeights = rowHeights.map((item) => item / element.height);
                    }
                } else if (type === "COLS") {
                    // 拖动列
                    const pageX = evt.pageX;
                    const startOriginX = this._startPoint[0];
                    const moveX = pageX - startOriginX;
                    // 拖拽的列索引
                    const colIndex = this._operateTableControlType[2];
                    const colWidths = element.colWidths.map((item) => item * element.width);
                    const currentWidth = colWidths[colIndex] + moveX;
                    element.width = element.width + moveX;
                    // 最小宽度限定！！！！
                    if (currentWidth > 20) {
                        colWidths[colIndex] = currentWidth;
                        element.colWidths = colWidths.map((item) => item / element.width);
                    }
                }

                this._startPoint = [evt.pageX, evt.pageY];
                this._command.executeUpdateRender([element]);
            }
        }
    }

    private _mousemove(evt: MouseEvent) {
        const operateElements = this.stageConfig.operateElements;
        if (this.stageConfig.insertElement && this._canCreate) {
            // 创建元素
            if (operateElements.length > 0) {
                // 当存在选中的元素的时候，移除
                this.stageConfig.setOperateElement(null, false);
                this.stageConfig.resetCheckDrawView();
            }
            const newElement = this._createElement(evt);
            if (newElement && newElement.type !== "text") {
                this.drawElement(newElement);
            }

            if (newElement && newElement.type === "text") {
                this._drawOprate([newElement]);
            }
        } else if (this._canMoveCanvas && this.stageConfig.canMove) {
            // 移动画布
            const scrollX = -(evt.pageX - this._startPoint[0]) + this.stageConfig.scrollX;
            const scrollY = -(evt.pageY - this._startPoint[1]) + this.stageConfig.scrollY;
            this._startPoint = [evt.pageX, evt.pageY];
            this.stageConfig.setScroll(scrollX, scrollY);
        } else if (this._canMoveElement && operateElements.length > 0) {
            // 移动元素
            this._moveElements(evt, operateElements);
        } else if (this._canResizeElement && operateElements.length > 0) {
            // 旋转缩放元素
            this._resizeElements(evt, operateElements);
        } else if (this._operateTableControlType) {
            // 调整表格
            this._resizeTable(evt, operateElements);
        } else if (this.stageConfig.tableSelectCells && this._operateTableCell) {
            // 表格选中
            const operateElement = operateElements.find(element => element.id === this.stageConfig.tableEditElementID) as IPPTTableElement;
            if (operateElement) {
                const { left, top } = this.stageConfig.getMousePosition(evt);
                const { row, col } = this.stageConfig.getMouseTableCell(operateElement as IPPTTableElement, left, top);
                this.stageConfig.tableSelectCells[1] = [row, col];
                let splitDisabled = false;
                let mergeDisabled = false;
                if (row === this.stageConfig.tableSelectCells[0][0] && col === this.stageConfig.tableSelectCells[0][1]) {
                    const tableCell = operateElement.data[row][col];
                    splitDisabled = tableCell.colspan > 1 || tableCell.rowspan > 1;
                    mergeDisabled = true;
                } else {
                    mergeDisabled = false;
                    splitDisabled = true;
                }
                this._listener.onTableCellEditChange && this._listener.onTableCellEditChange(mergeDisabled, splitDisabled);
                this._command.executeRender();
            }
        } else if (
            !this.stageConfig.insertElement &&
            !this.stageConfig.canMove &&
            !this._canMoveElement
        ) {
            // 悬浮到元素
            this._hoverCursor(evt, operateElements);
        }
    }

    // 文本框数据显示处理
    private _dealSelectText(evt: MouseEvent, operateElement: IPPTTextElement | IPPTShapeElement) {
        const selectArea = this.stageConfig.selectArea;
        if (selectArea && !(selectArea[0] === selectArea[2] && selectArea[1] === selectArea[3])) {
            let first = true;
            let fontSize: string | number = "";
            let isBold = false;
            let isItalic = false;
            let underline = true;
            let strikout = true;
            let fontFamily = "";
            const renderContent = this.stageConfig.getRenderContent(operateElement);
            const [startX, startY, endX, endY] = selectArea;
            renderContent.forEach((lineData, line) => {
                if (line >= startY && line <= endY) {
                    for (const [index, text] of lineData.texts.entries()) {
                        if (
                            (startY === endY && startX <= index && index < endX) ||
                            (startY !== endY && line === startY && startX <= index) ||
                            (startY !== endY && line !== startY && line !== endY) ||
                            (startY !== endY && line === endY && index <= endX)
                        ) {
                            if (first) {
                                first = false;
                                fontSize = text.fontSize;
                                isBold = text.fontWeight === "bold";
                                isItalic = text.fontStyle === "italic";
                                fontFamily = text.fontFamily;
                            } else {
                                if (fontSize !== text.fontSize) {
                                    fontSize = "";
                                }

                                if (text.fontWeight === "normal") {
                                    isBold = false;
                                }

                                if (text.fontStyle === "normal") {
                                    isItalic = false;
                                }

                                if (!text.underline) {
                                    underline = false;
                                }

                                if (!text.strikout) {
                                    strikout = false;
                                }

                                if (fontFamily !== text.fontFamily) {
                                    fontFamily = "";
                                }
                            }
                        }
                    }
                }
            });
            this._listener.onFontSizeChange && this._listener.onFontSizeChange(fontSize);
            this._listener.onFontWeightChange && this._listener.onFontWeightChange(isBold);
            this._listener.onFontStyleChange && this._listener.onFontStyleChange(isItalic);
            this._listener.onFontUnderLineChange && this._listener.onFontUnderLineChange(underline);
            this._listener.onFontStrikoutChange && this._listener.onFontStrikoutChange(strikout);
            this._listener.onFontFamilyChange && this._listener.onFontFamilyChange(fontFamily);
        } else {
            // 更新文本框光标位置
            const { left, top } = this.stageConfig.getMousePosition(evt);
            const x = left - operateElement.left;
            const y = top - operateElement.top;
            let offsetY = 0;
            if (operateElement.type === "shape") {
                const height = this.stageConfig.getTextHeight(operateElement);
                offsetY = operateElement.height / 2 - height / 2;
            }
            this._cursor.focus(x, y, offsetY);
            this._command.executeUpdateFontConfig();
            this.resetDrawOprate();
        }
    }

    private _mouseup(evt: MouseEvent, isMouseOut?: boolean) {
        const operateElements = this.stageConfig.operateElements;
        if (this.stageConfig.insertElement && this._canCreate) {
            const newElement = this._createElement(evt);
            if (newElement) {
                this._command.executeAddRender([newElement]);
            }
            this.stageConfig.setInsertElement(null);
        } else if (
            operateElements.length > 0 &&
            (this._canMoveElement || this._canResizeElement)
        ) {
            // 更改silde中对应的元素数据
            this._command.executeUpdateRender(
                deepClone(operateElements),
                true
            );
        } else if (!isMouseOut && this.stageConfig.textFocus && operateElements.length > 0) {
            const operateElement = operateElements.find(element => element.id === this.stageConfig.textFocusElementId);
            if (operateElement) {
                this._dealSelectText(evt, operateElement as (IPPTTextElement | IPPTShapeElement));
            }
        } else if (this._operateTableControlType) {
            this._command.executeUpdateRender(deepClone(operateElements), true);
        }
        this._textClick = null;
        this._canMoveCanvas = false;
        this._canMoveElement = false;
        this._canCreate = false;
        this._canResizeElement = false;
        this._operateCacheElements = [];
        this._operateRisizeElementId = "";
        this._tableControlType = null;
        this._operateTableControlType = null;
        this._operateTableCell = false;
    }

    private _mouseLeave(evt: MouseEvent) {
        this._mouseup(evt, true);
    }

    // 处理获取矩形区域的左上坐标点和左下坐标点
    private _getAreaPoint(
        startPoint: [number, number],
        endPoint: [number, number]
    ) {
        const minPoint = [
            Math.min(startPoint[0], endPoint[0]),
            Math.min(startPoint[1], endPoint[1])
        ];
        const maxPoint = [
            Math.max(startPoint[0], endPoint[0]),
            Math.max(startPoint[1], endPoint[1])
        ];
        return { minPoint, maxPoint };
    }

    private _getElementPosition(evt: MouseEvent) {
        const zoom = this.stageConfig.zoom;

        const { x, y } = this.stageConfig.getStageArea();
        const { offsetX, offsetY } = this.stageConfig.getCanvasOffset();

        const { minPoint, maxPoint } = this._getAreaPoint(this._startPoint, [
            evt.pageX,
            evt.pageY
        ]);

        const left = (minPoint[0] - x - offsetX) / zoom;
        const top = (minPoint[1] - y - offsetY) / zoom;
        const width = (maxPoint[0] - minPoint[0]) / zoom;
        const height = (maxPoint[1] - minPoint[1]) / zoom;

        return { left, top, width, height };
    }

    private _createElement(evt: MouseEvent) {
        let newElement: IPPTElement | undefined;
        if (this.stageConfig.insertElement && this._canCreate) {
            this.clear();

            const position = this._getElementPosition(evt);

            switch (this.stageConfig.insertElement.type) {
                case "text": {
                    newElement = createTextElement(position);
                    break;
                }
                case "shape": {
                    newElement = createShapeElement(
                        position,
                        this.stageConfig.insertElement.data.type
                    );
                    break;
                }
                case "line": {
                    const { left, top } = this.stageConfig.getMousePosition(evt);
                    const style = {
                        [LINE_TYPE.BEELINE]: "",
                        [LINE_TYPE.ARROW]: "arrow",
                        [LINE_TYPE.DOUBLE_ARROW]: "arrow",
                        [LINE_TYPE.DOT]: "dot",
                        [LINE_TYPE.DOUBLE_DOT]: "dot"
                    } as { [key: string]: string; };

                    let startStyle: "" | "arrow" | "dot" = "";
                    if (
                        this.stageConfig.insertElement.data.type ===
                            LINE_TYPE.DOUBLE_ARROW ||
                        this.stageConfig.insertElement.data.type ===
                            LINE_TYPE.DOUBLE_DOT
                    ) {
                        startStyle = style[this.stageConfig.insertElement.data.type] as "" | "arrow" | "dot";
                    }
                    const endStyle = style[this.stageConfig.insertElement.data.type] as "" | "arrow" | "dot";

                    newElement = createLineElement(
                        this._startOriginPoint[0],
                        this._startOriginPoint[1],
                        [
                            left - this._startOriginPoint[0],
                            top - this._startOriginPoint[1]
                        ],
                        startStyle,
                        endStyle
                    );
                    break;
                }
            }
        }
        return newElement;
    }

    private _getElementLinePoints(
        x: number,
        y: number,
        end: [number, number],
        rectWidth: number
    ) {
        const START: IRectParameter = [
            x - rectWidth,
            y - rectWidth / 2,
            rectWidth,
            rectWidth
        ];

        const END: IRectParameter = [
            x + end[0],
            y + end[1] - rectWidth / 2,
            rectWidth,
            rectWidth
        ];

        return {
            START,
            END
        };
    }

    /**
     * 考虑要不要做个map的换成 ？？？？？？？？？？？？？？？？？？？？？
     * @param param0 获取选中区域的九点区域坐标
     * @returns
     */
    private _getElementResizePoints(
        x: number,
        y: number,
        elementWidth: number,
        elementHeight: number,
        dashedLinePadding: number,
        resizeRectWidth: number
    ) {
        const LEFT_X = x - dashedLinePadding - resizeRectWidth;
        const RIGH_X = x + elementWidth + dashedLinePadding;
        const CENTER_X = (RIGH_X + LEFT_X) / 2;
        const TOP_Y = y - dashedLinePadding - resizeRectWidth;
        const BOTTOM_Y = y + elementHeight + dashedLinePadding;
        const CENTER_Y = (BOTTOM_Y + TOP_Y) / 2;

        const LEFT_TOP: IRectParameter = [
            LEFT_X,
            TOP_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const LEFT: IRectParameter = [
            LEFT_X,
            CENTER_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const LEFT_BOTTOM: IRectParameter = [
            LEFT_X,
            BOTTOM_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const TOP: IRectParameter = [
            CENTER_X,
            TOP_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const BOTTOM: IRectParameter = [
            CENTER_X,
            BOTTOM_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const RIGHT_TOP: IRectParameter = [
            RIGH_X,
            TOP_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const RIGHT: IRectParameter = [
            RIGH_X,
            CENTER_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const RIGHT_BOTTOM: IRectParameter = [
            RIGH_X,
            BOTTOM_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const ANGLE: IRectParameter = [
            CENTER_X,
            TOP_Y - resizeRectWidth * 2,
            resizeRectWidth,
            resizeRectWidth
        ];
        return {
            LEFT_TOP,
            LEFT,
            LEFT_BOTTOM,
            TOP,
            BOTTOM,
            RIGHT_TOP,
            RIGHT,
            RIGHT_BOTTOM,
            ANGLE
        };
    }

    private _drawOprate(elements: IPPTElement[]) {
        const zoom = this.stageConfig.zoom;
        if (elements.length === 0) return;
        const { x, y } = this.stageConfig.getStageOrigin();

        for (const element of elements) {
            this.ctx.save();
            // 缩放画布
            this.ctx.scale(zoom, zoom);

            if (element.type === "line") {
                this.ctx.translate(x, y);

                this.ctx.fillStyle = "#ffffff";
                this.ctx.strokeStyle = THEME_COLOR;
                this.ctx.lineWidth = 1 / zoom;
                const dashWidth = 8 / zoom;
                const rects: IRects = this._getElementLinePoints(
                    element.left,
                    element.top,
                    element.end,
                    dashWidth
                );
                this.ctx.fillStyle = "#ffffff";
                this.ctx.strokeStyle = THEME_COLOR;
                this.ctx.lineWidth = 1 / zoom;
                for (const key in rects) {
                    this.ctx.fillRect(...rects[key]);
                    this.ctx.strokeRect(...rects[key]);
                }
            } else {
                const sx = x + element.left;
                const sy = y + element.top;

                // 平移原点到元素起始点
                this.ctx.translate(sx, sy);
                const selectArea = this.stageConfig.selectArea;
                if (
                    selectArea &&
                    this.stageConfig.textFocus &&
                    (element.type === "text" || element.type === "shape")
                ) {
                    // 存在文本选中状态
                    const lineTexts = this.stageConfig.getRenderContent(element);
                    const x = TEXT_MARGIN;
                    let y = TEXT_MARGIN;
                    lineTexts.forEach((lineData, index) => {
                        const lineHeight = lineData.height * element.lineHeight;
                        const rangeRecord = this.stageConfig.getRenderSelect(
                            x,
                            y,
                            lineData,
                            index,
                            selectArea,
                            element
                        );
                        if (rangeRecord) this._renderRange(rangeRecord);
                        y = y + lineHeight;
                    });
                }

                // 平移坐标原点到元素中心
                this.ctx.translate(element.width / 2, element.height / 2);
                // 水平垂直翻转
                const isText = element.type === "text";
                // 旋转画布
                this.ctx.rotate((element.rotate / 180) * Math.PI);

                this.ctx.strokeStyle = THEME_COLOR;
                this.ctx.lineWidth = 1 / zoom;
                // 增加选中框与元素的间隙距离
                const margin = 1;
                const offsetX = -element.width / 2 - margin;
                const offsetY = -element.height / 2 - margin;
                this.ctx.strokeRect(
                    offsetX,
                    offsetY,
                    element.width + margin * 2,
                    element.height + margin * 2
                );

                const dashedLinePadding = 0 + margin / zoom;
                const dashWidth = 8 / zoom;

                const rects: IRects = this._getElementResizePoints(
                    offsetX,
                    offsetY,
                    element.width + margin * 2,
                    element.height + margin * 2,
                    dashedLinePadding,
                    dashWidth
                );
                this.ctx.fillStyle = "#ffffff";
                this.ctx.strokeStyle = THEME_COLOR;
                this.ctx.lineWidth = 1 / zoom;
                for (const key in rects) {
                    if (
                        isText &&
                        key !== "LEFT" &&
                        key !== "RIGHT" &&
                        key !== "ANGLE"
                    ) continue;
                    this.ctx.fillRect(...rects[key]);
                    this.ctx.strokeRect(...rects[key]);
                }
            }
            this.ctx.restore();
        }
    }

    private _horizontalZoom(
        mx: number,
        my: number,
        sx: number,
        sy: number,
        direction: number,
        originElement: Exclude<IPPTElement, IPPTLineElement>
    ) {
        const oldWidth = originElement.width;
        const angle = (originElement.rotate / 180) * Math.PI;
        // 在sx,sy以x轴平行的线段上取任意一点 绕sx，sy旋转angle
        const nPoint = [sx - 10, sy];
        const tn = this.stageConfig.rotate(nPoint[0], nPoint[1], sx, sy, angle);
        // 求 鼠标点 与 起始点的向量 在 tn点 与 起始点向量上投影的距离值 即为移动的距离
        // 向量a在向量b上的投影：设a、b向量的模分别为A、B，两向量夹角为θ，则a在b上的投影大小为Acosθ，而两向量的点积a·b=ABcosθ，所以cosθ=a·b/(AB)。则a在b上的投影为Acosθ=Aa·b/(AB)=a·b/B
        const a = { x: mx - sx, y: my - sy };
        const b = { x: tn[0] - sx, y: tn[1] - sy };
        // const A = Math.hypot(a.x, a.y);
        const B = Math.hypot(b.x, b.y);
        const a·b = a.x * b.x + a.y * b.y;

        // 移动距离
        const move = -(a·b / B) * direction;
        const newWidth = oldWidth + move;

        // 原点偏移
        const originOffsetX = move * Math.cos(angle) * direction;
        const originOffsetY = move * Math.sin(angle) * direction;

        return { ofx: originOffsetX, ofy: originOffsetY, width: newWidth };
    }

    private _verticalZoom(
        mx: number,
        my: number,
        sx: number,
        sy: number,
        direction: number,
        originElement: Exclude<IPPTElement, IPPTLineElement>
    ) {
        const oldHeight = originElement.height;
        const angle = (originElement.rotate / 180) * Math.PI;

        // 在sx,sy以y轴平行的线段上取任意一点 绕sx，sy旋转angle
        const nPoint = [sx, sy - 10];
        const tn = this.stageConfig.rotate(nPoint[0], nPoint[1], sx, sy, angle);
        // 求 鼠标点 与 起始点的向量 在 tn点 与 起始点向量上投影的距离值 即为移动的距离
        // 向量a在向量b上的投影：设a、b向量的模分别为A、B，两向量夹角为θ，则a在b上的投影大小为Acosθ，而两向量的点积a·b=ABcosθ，所以cosθ=a·b/(AB)。则a在b上的投影为Acosθ=Aa·b/(AB)=a·b/B
        const a = { x: mx - sx, y: my - sy };
        const b = { x: tn[0] - sx, y: tn[1] - sy };
        // const A = Math.hypot(a.x, a.y);
        const B = Math.hypot(b.x, b.y);
        const a·b = a.x * b.x + a.y * b.y;

        // 移动距离
        const move = -(a·b / B) * direction;
        const newHeight = oldHeight + move;

        // 原点偏移
        const originOffsetX = -move * Math.sin(angle) * direction;
        const originOffsetY = move * Math.cos(angle) * direction;

        return { ofx: originOffsetX, ofy: originOffsetY, height: newHeight };
    }

    public resetDrawOprate() {
        this.clear();
        const elements = this.stageConfig.operateElements;
        if (elements.length === 0) return;
        // this.drawElement(element);
        this._drawOprate(elements);
    }

    private _renderRange({ x, y, width, height }: any) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = "#AECBFA";
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    }

    public getFontSize(text: IFontData) {
        return this._text.getFontSize(text);
    }

    public hideCursor() {
        this._cursor.hideCursor();
    }
}
