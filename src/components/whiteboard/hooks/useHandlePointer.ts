import { Ref } from "vue";
import { OPTION_TYPE } from "../config";
import { ICanvasConfig, IElement, IPenElement, IPoint } from "../types";
import {
    getBoundsCoordsFromPoints,
    getCanvasPointPosition,
    getDistance,
    getTouchesCenter,
    getWhiteBoardPointPosition,
    throttleRAF
} from "../utils";
import useCreateElement from "./useCreateElement";
import useRenderElement from "./useRenderElement";
import useUpdateElement from "./useUpdateElement";
import useZoom from "./useZoom";

export default (
    canvas: Ref<HTMLCanvasElement | null>,
    context: Ref<CanvasRenderingContext2D | null>,
    elements: Ref<IElement[]>,
    storeElements: Ref<IElement[]>,
    canvasConfig: ICanvasConfig,
    disabled: Ref<boolean>
) => {
    const { createPenElement, createEraserElement } = useCreateElement(
        elements,
        canvasConfig
    );
    const { updateElement } = useUpdateElement(elements);
    const { renderElements } = useRenderElement(canvas, context, canvasConfig);
    const { updateScroll } = useZoom(canvas, canvasConfig);
    let targetElement: IElement | null = null;
    let startPoint: IPoint | null = null;
    // 两指间距离
    let twoPointLen = 0;
    // 两指间中心点
    let twoPointCenter = { x: 0, y: 0 };

    const canvasMove = (event: PointerEvent | TouchEvent) => {
        if (startPoint) {
            const { x, y } = getWhiteBoardPointPosition(event, canvasConfig);
            canvasConfig.scrollX += x - startPoint[0];
            canvasConfig.scrollY += y - startPoint[1];
            startPoint = [x, y];
            renderElements(elements.value);
        }
    };

    const handleDown = (event: PointerEvent | TouchEvent) => {
        if (disabled.value) return;
        if ((event.target as HTMLElement).tagName !== "CANVAS") return;
        switch (canvasConfig.optionType) {
            case OPTION_TYPE.MOUSE: {
                if (event instanceof TouchEvent && event.touches.length === 2) {
                    // 两指触控 执行放大操作
                    twoPointLen = getDistance(
                        {
                            x: event.touches[0].clientX,
                            y: event.touches[0].clientY
                        },
                        {
                            x: event.touches[1].clientX,
                            y: event.touches[1].clientY
                        }
                    );

                    twoPointCenter = getTouchesCenter(event.touches);
                } else if (
                    (event instanceof TouchEvent &&
                        event.touches.length === 1) ||
                    event instanceof PointerEvent
                ) {
                    const { x, y } = getWhiteBoardPointPosition(
                        event,
                        canvasConfig
                    );
                    startPoint = [x, y];
                }
                break;
            }
            case OPTION_TYPE.PEN: {
                const { x, y } = getCanvasPointPosition(event, canvasConfig);
                targetElement = createPenElement({ x, y });
                canvasConfig.isDrawing = true;
                break;
            }
            case OPTION_TYPE.ERASER: {
                const { x, y } = getCanvasPointPosition(event, canvasConfig);
                targetElement = createEraserElement({ x, y });
                canvasConfig.isDrawing = true;
                break;
            }
        }

        if (event instanceof TouchEvent) {
            window.addEventListener("touchmove", handleMove, { passive: true });
            window.addEventListener("touchend", handleUp, { passive: true });
        } else {
            window.addEventListener("pointermove", handleMove);
            window.addEventListener("pointerup", handleUp);
        }
    };

    const handleMove = throttleRAF((event: PointerEvent | TouchEvent) => {
        if (disabled.value) return;
        // 绘制
        switch (canvasConfig.optionType) {
            case OPTION_TYPE.MOUSE: {
                if (event instanceof TouchEvent && event.touches.length === 2) {
                    const newTwoPointLen = getDistance(
                        {
                            x: event.touches[0].clientX,
                            y: event.touches[0].clientY
                        },
                        {
                            x: event.touches[1].clientX,
                            y: event.touches[1].clientY
                        }
                    );

                    const changeZoom =
                        (newTwoPointLen - twoPointLen) / twoPointLen;
                    let newZoom =
                        changeZoom > 0
                            ? canvasConfig.zoom + 0.05
                            : canvasConfig.zoom - 0.05;

                    if (newZoom < 0.1) newZoom = 0.1;
                    const oldZoom = canvasConfig.zoom;
                    canvasConfig.zoom = newZoom;
                    twoPointLen = newTwoPointLen;
                    updateScroll(
                        newZoom,
                        oldZoom,
                        twoPointCenter.x,
                        twoPointCenter.y
                    );
                    renderElements(elements.value);
                } else if (
                    (event instanceof TouchEvent &&
                        event.touches.length === 1) ||
                    event instanceof PointerEvent
                ) {
                    canvasMove(event);
                }
                break;
            }
            case OPTION_TYPE.ERASER:
            case OPTION_TYPE.PEN: {
                if (!canvasConfig.isDrawing || !targetElement) return;
                const { x, y } = getCanvasPointPosition(event, canvasConfig);
                drawOnCanvas(x, y);
                break;
            }
            // case OPTION_TYPE.ERASER: {
            //     if (!canvasConfig.isDrawing || !startPoint) return;
            //     const { x, y } = getCanvasPointPosition(event, canvasConfig);
            //     const normalizedCanvasWidth = canvas.value!.width / canvasConfig.zoom;
            //     const normalizedCanvasHeight = canvas.value!.height / canvasConfig.zoom;
            //     const visibleElements = getVisibleElements(elements.value, canvasConfig.scrollX, canvasConfig.scrollY, normalizedCanvasWidth, normalizedCanvasHeight);
            //     checkCrossElements(
            //         startPoint,
            //         x,
            //         y,
            //         visibleElements
            //     );
            //     renderElements(elements.value);
            //     startPoint = [x, y];
            //     break;
            // }
        }
    });

    const drawOnCanvas = (x: number, y: number) => {
        if (!targetElement) return;
        switch (targetElement.type) {
            case OPTION_TYPE.ERASER:
            case OPTION_TYPE.PEN: {
                const points = (targetElement as IPenElement).points;
                updateElement(targetElement, {
                    points: [
                        ...points,
                        [
                            x - (targetElement as IPenElement).x,
                            y - (targetElement as IPenElement).y
                        ]
                    ]
                });
                // 置空恢复暂存
                storeElements.value = [];
                break;
            }
        }
        renderElements(elements.value);
    };

    const handleUp = (event: PointerEvent | TouchEvent) => {
        if (disabled.value) return;
        switch (canvasConfig.optionType) {
            case OPTION_TYPE.MOUSE: {
                if (event instanceof PointerEvent) {
                    canvasMove(event);
                }
                break;
            }
            case OPTION_TYPE.ERASER:
            case OPTION_TYPE.PEN: {
                if (!canvasConfig.isDrawing || !targetElement) return;
                const points = (targetElement as IPenElement).points;
                if (points.length === 1) {
                    updateElement(targetElement, {
                        points: [...points, [0.0001, 0.0001]]
                    });
                } else {
                    const { x, y } = getCanvasPointPosition(
                        event,
                        canvasConfig
                    );
                    updateElement(targetElement, {
                        points: [
                            ...points,
                            [
                                x - (targetElement as IPenElement).x,
                                y - (targetElement as IPenElement).y
                            ]
                        ]
                    });
                }
                // 更新一下元素width和height 暂时没有考虑旋转角度
                const [minX, minY, maxX, maxY] = getBoundsCoordsFromPoints(
                    (targetElement as IPenElement).points
                );
                updateElement(targetElement, {
                    width: maxX - minX,
                    height: maxY - minY
                });
                renderElements(elements.value);
                break;
            }
            // case OPTION_TYPE.ERASER: {
            //     if (!canvasConfig.isDrawing) return;
            //     // 橡皮擦模式在结束时过滤掉删除的元素
            //     elements.value = elements.value.filter(element => !element.isDelete);
            //     renderElements(elements.value);
            //     break;
            // }
        }
        targetElement = null;
        startPoint = null;
        canvasConfig.isDrawing = false;

        if (event instanceof TouchEvent) {
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("touchend", handleUp);
        } else {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
        }
    };

    return {
        handleDown,
        handleMove,
        handleUp
    };
};
