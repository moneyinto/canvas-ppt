/**
 * type: 元素类型 (pen: 笔记 compass: 圆规 ruler: 直尺)
 *
 * angle: 旋转角度
 *
 * isDelete: 是否删除
 *
 * locked: 是否锁定
 *
 * x: 元素横坐标
 *
 * y: 元素纵坐标
 *
 * width: 元素占位宽
 *
 * height: 元素占位高
 */
interface IBaseElement {
    id: string;
    type: "PEN" | "COMPASS" | "RULER" | "ERASER";
    angle: number;
    isDelete: boolean;
    locked: boolean;
    width: number;
    height: number;
    [key: string]: unknown;
}

export type IPoint = number[];

export interface IPenElement extends IBaseElement {
    x: number;
    y: number;
    points: IPoint[];
    lineWidth: number;
    strokeColor: string;
}

export interface ICompassElement extends IBaseElement {
    x: number;
    y: number;
    startAngle: number;
    drawAngle: number;
    r: number;
    lineWidth: number;
    strokeColor: string;
}

export interface IRulerElement extends IBaseElement {
    x: number;
    y: number;
    points: IPoint[];
    lineWidth: number;
    strokeColor: string;
}

export interface IOptionsConfig {
    offsetX: number;
    offsetY: number;
}

/**
 * offsetX: canvas距离window左边框距离
 *
 * offsetY: canvas距离window上边框距离
 *
 * scrollX: canvas横向位移
 *
 * scrollY: canvas纵向位移
 *
 * zoom: canvas缩放比例
 *
 * optionType: 操作类型
 *
 * isDrawing: 是否处于绘制阶段
 *
 * isMoveOrScale: 是否处于移动和缩放阶段
 */
export interface ICanvasConfig extends IOptionsConfig {
    scrollX: number;
    scrollY: number;
    zoom: number;
    optionType: string;
    lineWidth: number;
    strokeColor: string;
    isDrawing: boolean;
    isMoveOrScale: boolean;
}

export type IBoundsCoords = [number, number, number, number];

export interface ICompassData {
    r: number;
    startAngle: number;
    drawAngle: number;
    x: number;
    y: number;
}

export interface IRulerData {
    x: number;
    y: number;
    points: IPoint[];
    angle: number;
}

export interface ICenter {
    x: number;
    y: number;
}

export type IElement = IPenElement | ICompassElement | IRulerElement;
