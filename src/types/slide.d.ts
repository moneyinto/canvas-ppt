import { IGradientColor } from ".";
import { IPPTElement } from "./element";

/**
 * 幻灯片背景
 *
 * type: 背景类型（纯色、图片、渐变）
 *
 * color?: 背景颜色（纯色）
 *
 * image?: 图片地址（图片）
 *
 * imageSize?: 图片填充方式
 *
 * gradientType?: 渐变类型（线性、径向）
 *
 * gradientColor?: 渐变颜色
 *
 * gradientRotate?: 渐变角度（线性）
 */
export interface ISlideBackground {
    type: "solid" | "image" | "gradient";
    color?: string;
    image?: string;
    imageSize?: "cover" | "repeat";
    gradientType?: "linear" | "radial";
    gradientColor?: IGradientColor[];
    gradientRotate?: number;
}

/**
 * 幻灯片页面
 *
 * id: 页面ID
 *
 * viewportRatio: 画布尺寸
 *
 * elements: 元素集合
 *
 * remark?: 备注
 *
 * background?: 页面背景
 */
export interface ISlide {
    id: string;
    viewportRatio?: number;
    elements: IPPTElement[];
    background?: ISlideBackground;
}
