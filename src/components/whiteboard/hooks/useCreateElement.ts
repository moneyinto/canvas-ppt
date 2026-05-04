import { Ref } from "vue";
import { OPTION_TYPE } from "../config";
import { ICanvasConfig, ICenter, ICompassData, IElement, IRulerData } from "../types";
import { createRandomCode } from "../utils";

export default (elements: Ref<IElement[]>, canvasConfig: ICanvasConfig) => {
    const createElement = (element: IElement) => {
        elements.value.push(element);
        return element;
    };

    const createPenElement = ({ x, y }: ICenter) => {
        return createElement({
            id: createRandomCode(),
            type: OPTION_TYPE.PEN,
            width: 0,
            height: 0,
            x,
            y,
            points: [[0, 0]],
            angle: 0,
            isDelete: false,
            locked: false,
            lineWidth: canvasConfig.lineWidth,
            strokeColor: canvasConfig.strokeColor
        });
    };

    const createCompassElement = (data: ICompassData) => {
        return createElement({
            id: createRandomCode(),
            type: OPTION_TYPE.COMPASS,
            width: 0,
            height: 0,
            ...data,
            angle: 0,
            isDelete: false,
            locked: false,
            lineWidth: canvasConfig.lineWidth,
            strokeColor: canvasConfig.strokeColor
        });
    };

    const createRulerElement = (data: IRulerData) => {
        return createElement({
            id: createRandomCode(),
            type: OPTION_TYPE.RULER,
            width: 0,
            height: 0,
            ...data,
            angle: 0,
            isDelete: false,
            locked: false,
            lineWidth: canvasConfig.lineWidth,
            strokeColor: canvasConfig.strokeColor
        });
    };

    const createEraserElement = ({ x, y }: ICenter) => {
        return createElement({
            id: createRandomCode(),
            type: OPTION_TYPE.ERASER,
            width: 0,
            height: 0,
            x,
            y,
            points: [[0, 0]],
            angle: 0,
            isDelete: false,
            locked: false,
            lineWidth: 30,
            strokeColor: "transparent"
        });
    };

    return {
        createPenElement,
        createCompassElement,
        createRulerElement,
        createEraserElement
    };
};
