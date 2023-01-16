import Stage from ".";
import Listener from "../listener";
import StageConfig from "./config";
import { throttleRAF, deepClone, normalizeAngle } from "@/utils";
import Command from "../command";
import { createLineElement, createShapeElement } from "./create";
import { IPPTElement, IPPTLineElement } from "../types/element";
import { History } from "../editor/history";
import { ELEMENT_RESIZE, THEME_COLOR } from "../config/stage";
import { IElementOptions, IRectParameter, IRects } from "../types";
import { LINE_TYPE } from "../config/shapes";

export default class ControlStage extends Stage {
    private _command: Command;
    private _canMoveCanvas: boolean;
    private _canCreate: boolean;
    private _canMoveElement: boolean;
    private _canResizeElement: boolean;
    private _startPoint: [number, number];
    private _startOriginPoint: [number, number];
    private _opreateCacheElement: IPPTElement | null;
    private _startAngle: number;
    private _storeAngle: number;
    private _history: History;
    constructor(
        container: HTMLDivElement,
        listener: Listener,
        stageConfig: StageConfig,
        command: Command,
        history: History
    ) {
        super(container, listener, stageConfig);

        this._history = history;

        this._canMoveCanvas = false;
        this._canCreate = false;
        this._canMoveElement = false;
        this._canResizeElement = false;
        this._startPoint = [0, 0];
        this._startOriginPoint = [0, 0];
        this._startAngle = 0;
        this._storeAngle = 0;
        this._opreateCacheElement = null;

        this._command = command;
        // 后面考虑要不要改成window ？？？？？？？？？？？？？？？？？？？？？？
        this.container.addEventListener(
            "mousewheel",
            throttleRAF(this._mousewheel.bind(this) as (evt: Event) => void),
            false
        );
        this.container.addEventListener(
            "mousedown",
            this._mousedown.bind(this),
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
            this._mouseup.bind(this),
            false
        );
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

    private _mousedown(evt: MouseEvent) {
        this._canMoveCanvas = !this.stageConfig.insertElement;
        this._canCreate = !!this.stageConfig.insertElement;
        this._startPoint = [evt.pageX, evt.pageY];
        const { left, top } = this._getMousePosition(evt);
        this._startOriginPoint = [left, top];

        if (!this.stageConfig.insertElement && !this.stageConfig.canMove) {
            if (
                this.stageConfig.opreateType &&
                this.stageConfig.operateElement &&
                !this._canResizeElement
            ) {
                // resize rotate操作
                this._canResizeElement = true;
                const element = this.stageConfig.operateElement;
                if (
                    element.type !== "line" &&
                    this.stageConfig.opreateType === "ANGLE"
                ) {
                    // 旋转
                    const cx = element.left + element.width / 2;
                    const cy = element.top + element.height / 2;

                    this._startAngle = Math.atan2(top - cy, left - cx);
                    this._storeAngle = (element.rotate / 180) * Math.PI;
                }
                this._opreateCacheElement = deepClone(element);
            } else {
                const operateElement = this.stageConfig.getMouseInElement(
                    left,
                    top
                );

                // 存在已选中，重复选中不执行下面操作
                if (operateElement && this.stageConfig.operateElement && operateElement.id === this.stageConfig.operateElement.id) {
                    this._canMoveElement = true;
                    return;
                }

                this.stageConfig.setOperateElement(operateElement || null);
                this.stageConfig.resetCheckDrawView();
                if (operateElement) {
                    this.resetDrawOprate();
                    this._canMoveElement = true;
                } else {
                    this._canMoveElement = false;
                    this.clear();
                }
            }
        }
    }

    private _mousemove(evt: MouseEvent) {
        if (this.stageConfig.insertElement && this._canCreate) {
            // 创建元素
            if (this.stageConfig.operateElement) {
                // 当存在选中的元素的时候，移除
                this.stageConfig.setOperateElement(null);
                this.stageConfig.resetCheckDrawView();
            }
            const newElement = this._createElement(evt);
            if (newElement) this.drawElement(newElement);
        } else if (this._canMoveCanvas && this.stageConfig.canMove) {
            // 移动画布
            const scrollX = -(evt.pageX - this._startPoint[0]) + this.stageConfig.scrollX;
            const scrollY = -(evt.pageY - this._startPoint[1]) + this.stageConfig.scrollY;
            this._startPoint = [evt.pageX, evt.pageY];
            this.stageConfig.setScroll(scrollX, scrollY);
        } else if (this._canMoveElement && this.stageConfig.operateElement) {
            // 移动元素
            const zoom = this.stageConfig.zoom;
            const moveX = (evt.pageX - this._startPoint[0]) / zoom;
            const moveY = (evt.pageY - this._startPoint[1]) / zoom;
            this.stageConfig.setOperateElement({
                ...this.stageConfig.operateElement,
                left: this.stageConfig.operateElement.left + moveX,
                top: this.stageConfig.operateElement.top + moveY
            });
            this._startPoint = [evt.pageX, evt.pageY];
            this.resetDrawOprate();
        } else if (this._canResizeElement && this.stageConfig.operateElement) {
            if (this.stageConfig.operateElement.type !== "line") {
                // 旋转缩放元素
                if (this.stageConfig.opreateType === "ANGLE") {
                    // 旋转
                    const element = this.stageConfig.operateElement;
                    const cx = element.left + element.width / 2;
                    const cy = element.top + element.height / 2;

                    const { left, top } = this._getMousePosition(evt);
                    const currentAngle = Math.atan2(top - cy, left - cx);
                    const changeAngle = currentAngle - this._startAngle;
                    const angle = normalizeAngle(
                        changeAngle + this._storeAngle
                    );
                    this.stageConfig.setOperateElement({
                        ...this.stageConfig.operateElement,
                        rotate: angle
                    });
                    this.resetDrawOprate();
                } else {
                    // 缩放
                    // const element = this.stageConfig.operateElement;
                    const originElement = this._opreateCacheElement;
                    if (originElement && originElement.type !== "line") {
                        const { left, top } = this._getMousePosition(evt);
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
                        const angle = (originElement.rotate / 180) * Math.PI;
                        let [rx, ry] = this.stageConfig.rotate(
                            originElement.left,
                            originElement.top,
                            cx,
                            cy,
                            angle
                        );

                        if (resizeLeft || resizeRight) {
                            const { ofx, ofy, width } = this._horizontalZoom(
                                left,
                                top,
                                this._startOriginPoint[0],
                                this._startOriginPoint[1],
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
                                this._startOriginPoint[0],
                                this._startOriginPoint[1],
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

                        const [ox, oy] = this.stageConfig.rotate(
                            rx,
                            ry,
                            changeCX,
                            changeCY,
                            -angle
                        );

                        // 限制缩放的最小值
                        if (storeData.width > 0 && storeData.height > 0) {
                            this.stageConfig.setOperateElement({
                                ...originElement,
                                width: storeData.width,
                                height: storeData.height,
                                left: ox,
                                top: oy
                            });

                            this.resetDrawOprate();
                        }
                    }
                }
            } else {
                const { left, top } = this._getMousePosition(evt);
                const element = this.stageConfig.operateElement;
                // 线条控制
                if (this.stageConfig.opreateType === "START") {
                    this.stageConfig.setOperateElement({
                        ...element,
                        left,
                        top,
                        end: [
                            element.left - left + element.end[0],
                            element.top - top + element.end[1]
                        ]
                    });
                } else if (this.stageConfig.opreateType === "END") {
                    this.stageConfig.setOperateElement({
                        ...element,
                        end: [left - element.left, top - element.top]
                    });
                }
                this.resetDrawOprate();
            }
        } else if (
            !this.stageConfig.insertElement &&
            !this.stageConfig.canMove &&
            !this._canMoveElement
        ) {
            // 悬浮到元素
            const { left, top } = this._getMousePosition(evt);

            if (this.stageConfig.operateElement) {
                const zoom = this.stageConfig.zoom;
                if (this.stageConfig.operateElement.type === "line") {
                    const element = this.stageConfig.operateElement;
                    const dashWidth = 8 / zoom;

                    const rects: IRects = this._getElementLinePoints(
                        element.left,
                        element.top,
                        element.end,
                        dashWidth
                    );

                    this.stageConfig.setOperateType("");
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

                    this.container.style.cursor =
                        (ELEMENT_RESIZE as IElementOptions)[
                            this.stageConfig.opreateType
                        ] || "default";
                } else {
                    const element = this.stageConfig.operateElement;
                    // 鼠标悬浮到操作区域展示形式
                    const margin = 1;
                    const offsetX = -element.width / 2 - margin;
                    const offsetY = -element.height / 2 - margin;

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

                    const cx = element.left + element.width / 2;
                    const cy = element.top + element.height / 2;

                    this.stageConfig.setOperateType("");
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
                                (element.rotate / 180) * Math.PI
                            )
                        ) {
                            this.stageConfig.setOperateType(key);
                            break;
                        }
                    }

                    // 考虑结合旋转角度来改变优化cursor ？？？？？？？？？？？？？？？？？？？？
                    this.container.style.cursor =
                        (ELEMENT_RESIZE as IElementOptions)[
                            this.stageConfig.opreateType
                        ] || "default";
                }
            }

            if (!this.stageConfig.opreateType) {
                const hoverElement = this.stageConfig.getMouseInElement(
                    left,
                    top
                );

                if (hoverElement) {
                    if (this.container.style.cursor !== "move") {
                        this.container.style.cursor = "move";
                    }
                } else {
                    if (this.container.style.cursor !== "default") {
                        this.container.style.cursor = "default";
                    }
                }
            }
        }
    }

    private _mouseup(evt: MouseEvent) {
        if (this.stageConfig.insertElement && this._canCreate) {
            const newElement = this._createElement(evt);
            if (newElement) {
                this.stageConfig.addElement(newElement);

                this._history.add();

                // 创建完元素默认选中元素
                this.stageConfig.setOperateElement(newElement);
                this.stageConfig.resetCheckDrawOprate();
            }
            this.stageConfig.setInsertElement(null);
        } else if (
            this.stageConfig.operateElement &&
            (this._canMoveElement || this._canResizeElement)
        ) {
            // 更改silde中对应的元素数据
            const slide = this.stageConfig.getCurrentSlide();
            if (slide) {
                const i = slide.elements.findIndex(
                    (element) =>
                        element.id === this.stageConfig.operateElement?.id
                );
                slide.elements[i] = deepClone(this.stageConfig.operateElement);
                this._history.add();
            }
        }
        this._canMoveCanvas = false;
        this._canMoveElement = false;
        this._canCreate = false;
        this._canResizeElement = false;
        this._opreateCacheElement = null;
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

    private _getMousePosition(evt: MouseEvent) {
        const zoom = this.stageConfig.zoom;

        const { x, y } = this.stageConfig.getStageArea();
        const { offsetX, offsetY } = this.stageConfig.getCanvasOffset();

        const left = (evt.pageX - x - offsetX) / zoom;
        const top = (evt.pageY - y - offsetY) / zoom;

        return { left, top };
    }

    private _createElement(evt: MouseEvent) {
        let newElement: IPPTElement | undefined;
        if (this.stageConfig.insertElement && this._canCreate) {
            this.clear();

            const position = this._getElementPosition(evt);

            switch (this.stageConfig.insertElement.type) {
                case "shape": {
                    newElement = createShapeElement(
                        position,
                        this.stageConfig.insertElement.data.type
                    );
                    break;
                }
                case "line": {
                    const { left, top } = this._getMousePosition(evt);
                    const style = {
                        [LINE_TYPE.BEELINE]: "",
                        [LINE_TYPE.ARROW]: "arrow",
                        [LINE_TYPE.DOUBLE_ARROW]: "arrow",
                        [LINE_TYPE.DOT]: "dot",
                        [LINE_TYPE.DOUBLE_DOT]: "dot"
                    };

                    let startStyle: "" | "arrow" | "dot" = "";
                    if (
                        this.stageConfig.insertElement.data.type ===
                            LINE_TYPE.DOUBLE_ARROW ||
                        this.stageConfig.insertElement.data.type ===
                            LINE_TYPE.DOUBLE_DOT
                    ) {
                        startStyle = style[
                            this.stageConfig.insertElement.data.type
                        ] as "" | "arrow" | "dot";
                    }
                    const endStyle = style[
                        this.stageConfig.insertElement.data.type
                    ] as "" | "arrow" | "dot";

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

    private _drawOprate(element: IPPTElement) {
        const zoom = this.stageConfig.zoom;
        if (!element) return;
        const { x, y } = this.stageConfig.getStageOrigin();

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
            const ox = x + element.left + element.width / 2;
            const oy = y + element.top + element.height / 2;

            // 平移坐标原点
            this.ctx.translate(ox, oy);
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
                this.ctx.fillRect(...rects[key]);
                this.ctx.strokeRect(...rects[key]);
            }
        }

        this.ctx.restore();
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
        const element = this.stageConfig.operateElement;
        if (!element) return;
        this.drawElement(element);
        this._drawOprate(element);
    }
}
