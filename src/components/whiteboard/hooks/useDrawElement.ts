import { Ref } from "vue";
import { OPTION_TYPE } from "../config";
import { ICanvasConfig, ICompassData, IElement, IRulerData, IRulerElement } from "../types";
import useCreateElement from "./useCreateElement";
import useRenderElement from "./useRenderElement";
import useUpdateElement from "./useUpdateElement";

export default (
    canvas: Ref<HTMLCanvasElement | null>,
    context: Ref<CanvasRenderingContext2D | null>,
    elements: Ref<IElement[]>,
    storeElements: Ref<IElement[]>,
    canvasConfig: ICanvasConfig
) => {
    const { updateElement } = useUpdateElement(elements);
    const { renderElements } = useRenderElement(canvas, context, canvasConfig);
    const { createCompassElement, createRulerElement } = useCreateElement(elements, canvasConfig);
    let targetElement: IElement | null = null;
    const drawStart = (data: ICompassData | IRulerData) => {
        switch (canvasConfig.optionType) {
            case OPTION_TYPE.COMPASS: {
                targetElement = createCompassElement(data as ICompassData);
                break;
            }
            case OPTION_TYPE.RULER: {
                targetElement = createRulerElement(data as IRulerData);
            }
        }
        renderElements(elements.value);
    };

    const drawing = (data: ICompassData | IRulerData) => {
        if (!targetElement) return;
        switch (canvasConfig.optionType) {
            case OPTION_TYPE.COMPASS:
            case OPTION_TYPE.RULER: {
                updateElement(targetElement, {
                    ...data
                });
                break;
            }
        }
        renderElements(elements.value);
    };

    const drawEnd = () => {
        if (targetElement && targetElement.type === OPTION_TYPE.RULER) {
            if ((targetElement as IRulerElement).points[0][0] === (targetElement as IRulerElement).points[1][0]) {
                // 直线只是一个点，移除该元素
                const index = elements.value.findIndex(element => element.id === targetElement!.id);
                elements.value.splice(index, 1);
            }
        }
        // 置空恢复暂存
        storeElements.value = [];
        targetElement = null;
    };

    return {
        drawStart,
        drawing,
        drawEnd
    };
};
