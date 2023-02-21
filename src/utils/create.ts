import { THEME_COLOR, VIEWPORT_SIZE, VIEWRATIO } from "../plugins/config/stage";
import { IShape } from "../plugins/types/shape";
import {
    IElementPosition,
    IPPTImageElement,
    IPPTLineElement,
    IPPTShapeElement,
    IPPTTextElement
} from "../plugins/types/element";

/**
 * 生成随机码
 * @param len 随机码长度
 */
export const createRandomCode = (len = 6) => {
    const charset =
        "_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const maxLen = charset.length;
    let ret = "";
    for (let i = 0; i < len; i++) {
        const randomIndex = Math.floor(Math.random() * maxLen);
        ret += charset[randomIndex];
    }
    return ret;
};

export const createTextElement = (position: IElementPosition) => {
    const { left, top, width, height } = position;
    const id = createRandomCode();
    const name = "文本";
    const newElement: IPPTTextElement = {
        name,
        type: "text",
        content: [],
        wordSpace: 1,
        lineHeight: 2,
        id,
        left,
        top,
        width,
        height: 10 + 24 * 2,
        rotate: 0,
        align: "left"
    };
    // 文本框默认边距5 默认字体大小24
    return newElement;
};

export const createShapeElement = (
    position: IElementPosition,
    shape: IShape
) => {
    const { left, top, width, height } = position;
    const id = createRandomCode();
    const name = "形状";
    const newElement: IPPTShapeElement = {
        name,
        type: "shape",
        shape,
        id,
        left,
        top,
        width,
        height,
        fill: THEME_COLOR,
        fixedRatio: false,
        rotate: 0
    };

    return newElement;
};

export const createLineElement = (
    left: number,
    top: number,
    end: [number, number],
    startStyle: "" | "arrow" | "dot",
    endStyle: "" | "arrow" | "dot"
) => {
    const id = createRandomCode();
    const name = "线条";
    const newElement: IPPTLineElement = {
        name,
        type: "line",
        id,
        left,
        top,
        style: "solid",
        start: [0, 0],
        end,
        borderWidth: 2,
        color: THEME_COLOR,
        startStyle,
        endStyle
    };

    return newElement;
};

export const createImageElement = (width: number, height: number, src: string) => {
    const VIEW_HEIGHT = VIEWPORT_SIZE * VIEWRATIO;
    let resultWidth = width;
    let resultHeight = height;
    if (resultWidth > VIEWPORT_SIZE) {
        resultHeight = resultHeight / resultWidth * VIEWPORT_SIZE;
        resultWidth = VIEWPORT_SIZE;
    }
    if (resultHeight > VIEW_HEIGHT) {
        resultWidth = resultWidth / resultHeight * VIEW_HEIGHT;
        resultHeight = VIEW_HEIGHT;
    }
    const id = createRandomCode();
    const name = "图片";
    const newElement: IPPTImageElement = {
        name,
        type: "image",
        id,
        fixedRatio: false,
        left: 0,
        top: 0,
        rotate: 0,
        streach: 0,
        width: resultWidth,
        height: resultHeight,
        src
    };

    return newElement;
};
