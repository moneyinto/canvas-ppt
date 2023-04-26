import {
    IPPTElementOutline,
    IPPTElementShadow,
    IPPTShapeElement,
    IPPTTextElement
} from "@/types/element";
import Pptxgen from "pptxgenjs";
import tinycolor from "tinycolor2";
import { getShapePath } from "./shape";
import { SvgPoints, toPoints } from "./svgPathParser";
const INCH_PX_RATIO = 100;
const PT_PX_RATIO = 0.73;

export const formatColor = (_color: string) => {
    const c = tinycolor(_color);
    const alpha = c.getAlpha();
    const color = alpha === 0 ? "#ffffff" : c.setAlpha(1).toHexString();
    return {
        alpha,
        color
    };
};

const getOutlineOption = (
    outline: IPPTElementOutline
): Pptxgen.ShapeLineProps => {
    const opacity = outline.opacity === undefined ? 0 : outline.opacity;
    return {
        color: outline.color,
        transparency: opacity,
        width: (outline.width || 2) * PT_PX_RATIO,
        dashType: outline.style === "dashed" ? "dash" : "solid"
    };
};

type Points = Array<
    | { x: number; y: number; moveTo?: boolean }
    | {
          x: number;
          y: number;
          curve: {
              type: "arc";
              hR: number;
              wR: number;
              stAng: number;
              swAng: number;
          };
      }
    | {
          x: number;
          y: number;
          curve: { type: "quadratic"; x1: number; y1: number };
      }
    | {
          x: number;
          y: number;
          curve: {
              type: "cubic";
              x1: number;
              y1: number;
              x2: number;
              y2: number;
          };
      }
    | { close: true }
>;

// 获取阴影配置
const getShadowOption = (shadow: IPPTElementShadow): Pptxgen.ShadowProps => {
    const { h, v } = shadow;

    let offset = 4;
    let angle = 45;

    if (h === 0 && v === 0) {
        offset = 4;
        angle = 45;
    } else if (h === 0) {
        if (v > 0) {
            offset = v;
            angle = 90;
        } else {
            offset = -v;
            angle = 270;
        }
    } else if (v === 0) {
        if (h > 0) {
            offset = h;
            angle = 1;
        } else {
            offset = -h;
            angle = 180;
        }
    } else if (h > 0 && v > 0) {
        offset = Math.max(h, v);
        angle = 45;
    } else if (h > 0 && v < 0) {
        offset = Math.max(h, -v);
        angle = 315;
    } else if (h < 0 && v > 0) {
        offset = Math.max(-h, v);
        angle = 135;
    } else if (h < 0 && v < 0) {
        offset = Math.max(-h, -v);
        angle = 225;
    }

    return {
        type: "outer",
        color: shadow.color.replace("#", ""),
        blur: shadow.blur * PT_PX_RATIO,
        offset,
        angle
    };
};

const formatPoints = (points: SvgPoints): Points => {
    return points.map((point) => {
        if (point.close !== undefined) {
            return { close: true };
        } else if (point.type === "M") {
            return {
                x: (point.x || 0) / INCH_PX_RATIO,
                y: (point.y || 0) / INCH_PX_RATIO,
                moveTo: true
            };
        } else if (point.curve) {
            if (point.curve.type === "cubic") {
                return {
                    x: (point.x || 0) / INCH_PX_RATIO,
                    y: (point.y || 0) / INCH_PX_RATIO,
                    curve: {
                        type: "cubic",
                        x1: (point.curve.x1 as number) / INCH_PX_RATIO,
                        y1: (point.curve.y1 as number) / INCH_PX_RATIO,
                        x2: (point.curve.x2 as number) / INCH_PX_RATIO,
                        y2: (point.curve.y2 as number) / INCH_PX_RATIO
                    }
                };
            } else if (point.curve.type === "quadratic") {
                return {
                    x: (point.x || 0) / INCH_PX_RATIO,
                    y: (point.y || 0) / INCH_PX_RATIO,
                    curve: {
                        type: "quadratic",
                        x1: (point.curve.x1 as number) / INCH_PX_RATIO,
                        y1: (point.curve.y1 as number) / INCH_PX_RATIO
                    }
                };
            }
        }
        return {
            x: (point.x || 0) / INCH_PX_RATIO,
            y: (point.y || 0) / INCH_PX_RATIO
        };
    });
};

export const addText = (slide: Pptxgen.Slide, element: IPPTTextElement) => {
    const options: Pptxgen.TextPropsOptions = {
        x: element.left / INCH_PX_RATIO,
        y: element.top / INCH_PX_RATIO,
        w: element.width / INCH_PX_RATIO,
        h: element.height / INCH_PX_RATIO,
        charSpacing: element.wordSpace / INCH_PX_RATIO,
        valign: "top",
        lineSpacingMultiple: element.lineHeight * PT_PX_RATIO,
        align: element.align,
        rectRadius: 0
    };
    if (element.rotate) options.rotate = element.rotate;
    if (element.fill) {
        const opacity = element.fill.opacity === undefined ? 0 : element.fill.opacity;
        options.fill = { transparency: opacity };
        if (element.fill.color) options.fill.color = element.fill.color;
    }
    if (element.outline) {
        options.line = getOutlineOption(element.outline);
    }
    if (element.shadow) options.shadow = getShadowOption(element.shadow);
    const textProps: Pptxgen.TextProps[] = [];
    const texts = element.content.slice(0, element.content.length - 1);
    for (const text of texts) {
        textProps.push({
            text: text.value,
            options: {
                fontSize: text.fontSize * PT_PX_RATIO,
                color: text.fontColor,
                fontFace: text.fontFamily,
                bold: text.fontWeight === "bold",
                italic: text.fontStyle === "italic",
                strike: text.strikout ? "sngStrike" : false,
                underline: {
                    style: text.underline ? "heavy" : "none"
                }
            }
        });
    }
    slide.addText(textProps, options);
};

export const addShape = (slide: Pptxgen.Slide, element: IPPTShapeElement) => {
    const path = getShapePath(
        element.shape,
        element.width,
        element.height,
        true
    ) as string;
    const points = formatPoints(toPoints(path));
    const options: Pptxgen.ShapeProps = {
        x: element.left / INCH_PX_RATIO,
        y: element.top / INCH_PX_RATIO,
        w: element.width / INCH_PX_RATIO,
        h: element.height / INCH_PX_RATIO,
        points
    };
    if (element.fill?.color) {
        options.fill = {
            color: element.fill.color,
            transparency: element.fill.opacity || 0
        };
    }
    if (element.flipH) options.flipH = element.flipH === -1;
    if (element.flipV) options.flipV = element.flipV === -1;
    if (element.shadow) options.shadow = getShadowOption(element.shadow);
    if (element.outline?.width) options.line = getOutlineOption(element.outline);
    if (element.rotate) options.rotate = element.rotate;
    slide.addShape("custGeom" as Pptxgen.ShapeType, options);
};
