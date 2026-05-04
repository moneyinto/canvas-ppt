import { Ref } from "vue";
import { OPTION_TYPE } from "../config";
import {
    ICanvasConfig,
    ICompassElement,
    IElement,
    IPenElement,
    IRulerElement
} from "../types";
import {
    getElementBoundsCoords,
    getPenSvgPath,
    getVisibleElements
} from "../utils";

export default (
    canvas: Ref<HTMLCanvasElement | null>,
    context: Ref<CanvasRenderingContext2D | null>,
    canvasConfig: ICanvasConfig
) => {
    // 绘制笔记
    const renderPenElement = (element: IPenElement) => {
        // 点少于两个时不进行绘制
        if (element.points.length < 2 || !context.value) return;
        const [x1, y1, x2, y2] = getElementBoundsCoords(element);

        // cx, cy 最小矩形中心点在canvas中的位置
        const cx = (x1 + x2) / 2 + canvasConfig.scrollX;
        const cy = (y1 + y2) / 2 + canvasConfig.scrollY;

        // 笔记起始点相对于最小矩形中心点偏移位置
        const shiftX = (x2 - x1) / 2 - (element.x - x1);
        const shiftY = (y2 - y1) / 2 - (element.y - y1);

        // 存储状态
        context.value.save();

        // 缩放
        context.value.scale(
            window.devicePixelRatio * canvasConfig.zoom,
            window.devicePixelRatio * canvasConfig.zoom
        );

        // 移动坐标系原点
        context.value.translate(cx, cy);

        // 目标旋转对应的角度
        context.value.rotate(element.angle);
        // 坐标原点移动到笔记起始位置
        context.value.translate(-shiftX, -shiftY);

        // 绘制笔记
        context.value.fillStyle = element.strokeColor;
        const path = getPenSvgPath(element.points, element.lineWidth);
        context.value.fill(path);

        // 状态复原
        context.value.restore();
    };

    const renderCompassElement = (element: ICompassElement) => {
        if (!context.value) return;
        // 存储状态
        context.value.save();

        // 缩放
        context.value.scale(
            window.devicePixelRatio * canvasConfig.zoom,
            window.devicePixelRatio * canvasConfig.zoom
        );

        const cx = element.x + canvasConfig.scrollX;
        const cy = element.y + canvasConfig.scrollY;

        // 移动坐标系原点 到 圆心
        context.value.translate(cx, cy);

        // 目标旋转对应的角度
        context.value.rotate(element.angle);

        // 绘制笔记
        context.value.strokeStyle = element.strokeColor;
        context.value.lineWidth = element.lineWidth / 1.5;
        context.value.beginPath();
        context.value.arc(
            0,
            0,
            element.r,
            (element.startAngle * Math.PI) / 180,
            (element.drawAngle * Math.PI) / 180,
            element.drawAngle - element.startAngle < 0
        );

        context.value.stroke();

        // 状态复原
        context.value.restore();
    };

    const renderRulerElement = (element: IRulerElement) => {
        if (!context.value) return;
        // 存储状态
        context.value.save();

        // 缩放
        context.value.scale(
            window.devicePixelRatio * canvasConfig.zoom,
            window.devicePixelRatio * canvasConfig.zoom
        );

        const cx = element.x + canvasConfig.scrollX;
        const cy = element.y + canvasConfig.scrollY;

        // 移动坐标系原点 到 起始点
        context.value.translate(cx, cy);

        // 目标旋转对应的角度
        context.value.rotate(element.angle * Math.PI / 180);

        // 绘制笔记
        context.value.strokeStyle = element.strokeColor;
        context.value.lineWidth = element.lineWidth / 1.5;
        context.value.beginPath();
        context.value.moveTo(element.points[0][0], element.points[0][1]);
        context.value.lineTo(element.points[1][0], element.points[1][1]);
        context.value.closePath();

        context.value.stroke();

        // 状态复原
        context.value.restore();
    };

    const renderEraserElement = (element: IPenElement) => {
        // 点少于两个时不进行绘制
        if (element.points.length < 2 || !context.value) return;
        const [x1, y1, x2, y2] = getElementBoundsCoords(element);

        // cx, cy 最小矩形中心点在canvas中的位置
        const cx = (x1 + x2) / 2 + canvasConfig.scrollX;
        const cy = (y1 + y2) / 2 + canvasConfig.scrollY;

        // 笔记起始点相对于最小矩形中心点偏移位置
        const shiftX = (x2 - x1) / 2 - (element.x - x1);
        const shiftY = (y2 - y1) / 2 - (element.y - y1);

        // 存储状态
        context.value.save();

        // 缩放
        context.value.scale(
            window.devicePixelRatio * canvasConfig.zoom,
            window.devicePixelRatio * canvasConfig.zoom
        );

        // 移动坐标系原点
        context.value.translate(cx, cy);
        // 坐标原点移动到笔记起始位置
        context.value.translate(-shiftX, -shiftY);

        context.value.fillStyle = "transparent";
        const path = getPenSvgPath(element.points, element.lineWidth);
        context.value.fill(path);

        context.value.clip(path);

        // 还原坐标系
        context.value.translate(shiftX, shiftY);
        context.value.translate(-cx, -cy);

        context.value.clearRect(0, 0, canvas.value!.width, canvas.value!.height);

        // 状态复原
        context.value.restore();
    };

    const renderElements = (elements: IElement[]) => {
        if (!canvas.value || !context.value) return;
        const normalizedCanvasWidth = canvas.value.width / canvasConfig.zoom;
        const normalizedCanvasHeight = canvas.value.height / canvasConfig.zoom;
        context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
        const visibleElements = getVisibleElements(
            elements,
            canvasConfig.scrollX,
            canvasConfig.scrollY,
            normalizedCanvasWidth,
            normalizedCanvasHeight
        );

        // 绘制canvas
        visibleElements.forEach((element) => {
            if (!element.isDelete) {
                switch (element.type) {
                    case OPTION_TYPE.PEN:
                        renderPenElement(element as IPenElement);
                        break;
                    case OPTION_TYPE.COMPASS:
                        renderCompassElement(element as ICompassElement);
                        break;
                    case OPTION_TYPE.RULER:
                        renderRulerElement(element as IRulerElement);
                        break;
                    case OPTION_TYPE.ERASER:
                        renderEraserElement(element as IPenElement);
                        break;
                }
            }
        });
    };

    return {
        renderElements
    };
};
