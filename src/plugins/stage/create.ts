import { THEME_COLOR } from "../config/stage";
import { IShape } from "../types/shape";
import { IElementPosition, IPPTShapeElement } from "../types/element";

/**
 * 生成随机码
 * @param len 随机码长度
 */
export const createRandomCode = (len = 6) => {
    const charset = "_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const maxLen = charset.length;
    let ret = "";
    for (let i = 0; i < len; i++) {
        const randomIndex = Math.floor(Math.random() * maxLen);
        ret += charset[randomIndex];
    }
    return ret;
};

export const createShapeElement = (position: IElementPosition, shape: IShape) => {
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
