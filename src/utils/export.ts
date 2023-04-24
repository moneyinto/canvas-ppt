import { IPPTTextElement } from "@/types/element";
import Pptxgen from "pptxgenjs";
import tinycolor from "tinycolor2";
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

export const addText = (slide: Pptxgen.Slide, element: IPPTTextElement) => {
    const options: Pptxgen.TextPropsOptions = {
        x: 0 / INCH_PX_RATIO,
        y: element.top / INCH_PX_RATIO,
        w: element.width / INCH_PX_RATIO,
        h: element.height / INCH_PX_RATIO,
        charSpacing: element.wordSpace / INCH_PX_RATIO,
        valign: "middle",
        lineSpacingMultiple: element.lineHeight * PT_PX_RATIO,
        autoFit: true
    };
    if (element.rotate) options.rotate = element.rotate;
    const textProps: Pptxgen.TextProps[] = [];
    const texts = element.content.slice(0, element.content.length - 1);
    for (const text of texts) {
        textProps.push({
            text: text.value,
            options: {
                fontSize: text.fontSize * PT_PX_RATIO,
                color: formatColor(text.fontColor).color,
                fontFace: text.fontFamily,
                bold: text.fontWeight === "bold"
            }
        });
    }
    slide.addText(textProps, options);
};
