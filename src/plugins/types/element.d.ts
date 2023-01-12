import { IShape, IShapeItem } from "./shape";

export interface IElementPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

/**
 * 元素通用属性
 *
 * id: 元素ID
 *
 * name: 元素名
 *
 * left: 元素水平方向位置（距离画布左侧）
 *
 * top: 元素垂直方向位置（距离画布顶部）
 *
 * groupId?: 组合ID（拥有相同组合ID的元素即为同一组合元素成员）
 *
 * width: 元素宽度
 *
 * height: 元素高度
 *
 * zIndex: 元素层级
 */
interface IPPTBaseElement {
    id: string;
    name: string,
    left: number;
    top: number;
    groupId?: string;
    width: number;
    height: number;
    zIndex?: number;
}

/**
 * 元素阴影
 *
 * h: 水平偏移量
 *
 * v: 垂直偏移量
 *
 * blur: 模糊程度
 *
 * color: 阴影颜色
 */
export interface IPPTElementShadow {
    h: number;
    v: number;
    blur: number;
    color: string;
}

/**
 * 元素边框
 *
 * style?: 边框样式（实线或虚线）
 *
 * width?: 边框宽度
 *
 * color?: 边框颜色
 */
export interface IPPTElementOutline {
    style?: "dashed" | "solid";
    width?: number;
    color?: string;
}

/**
 * 形状渐变
 *
 * type: 渐变类型（径向、线性）
 *
 * color: 渐变颜色
 *
 * rotate: 渐变角度（线性渐变）
 */
export interface IShapeGradient {
    type: "linear" | "radial";
    color: [string, string];
    rotate: number;
}

/**
 * 形状内文本
 *
 * content: 文本内容（HTML字符串）
 *
 * defaultFontName: 默认字体（会被文本内容中的HTML内联样式覆盖）
 *
 * defaultColor: 默认颜色（会被文本内容中的HTML内联样式覆盖）
 *
 * defaultFontSize: 默认字体大小（会被文本内容中的HTML内联样式覆盖）
 *
 * align: 文本对齐方向（垂直方向）
 */
export interface IShapeText {
    content: string;
    defaultFontName: string;
    defaultColor: string;
    defaultFontSize: string;
    align: "top" | "middle" | "bottom";
}

/**
 * 形状元素
 *
 * type: 元素类型（shape）
 *
 * shape: 形状类型
 *
 * fixedRatio: 固定形状宽高比例
 *
 * fill: 填充，不存在渐变时生效
 *
 * rotate: 旋转角度
 * 
 * gradient?: 渐变，该属性存在时将优先作为填充
 *
 * outline?: 边框
 *
 * opacity?: 不透明度
 *
 * flipH?: 水平翻转
 *
 * flipV?: 垂直翻转
 *
 * shadow?: 阴影
 *
 * text?: 形状内文本
 */
export interface IPPTShapeElement extends IPPTBaseElement {
    type: "shape";
    shape: IShape;
    fixedRatio: boolean;
    fill: string;
    rotate: number;
    gradient?: IShapeGradient;
    outline?: IPPTElementOutline;
    opacity?: number;
    flipH?: boolean;
    flipV?: boolean;
    shadow?: IPPTElementShadow;
    text?: IShapeText;
}

/**
 * 线条元素
 *
 * type: 元素类型 (line)
 *
 * start: 起点位置 ([x, y])
 *
 * end: 终点位置 ([x, y])
 *
 * style: 线条样式（实线、虚线、点线间隔）
 *
 * color: 线条颜色
 *
 * startStyle: 起点样式（无、箭头、圆点）
 *
 * endStyle: 终点样式（无、箭头、圆点）
 *
 * borderWidth: 线粗
 */

export interface IPPTLineElement extends Omit<IPPTBaseElement, "height" | "width"> {
    type: "line";
    start: [number, number];
    end: [number, number];
    style: "solid" | "dashed" | "dashedPoint";
    color: string;
    startStyle: "" | "arrow" | "dot";
    endStyle: "" | "arrow" | "dot";
    borderWidth: number;
}

export type IPPTElement = IPPTShapeElement | IPPTLineElement;

export interface ICreatingTextElement {
    type: "text";
}

export interface ICreatingShapeElement {
    type: "shape";
    data: IShapeItem;
}

export type ICreatingElement = ICreatingTextElement | ICreatingShapeElement;
