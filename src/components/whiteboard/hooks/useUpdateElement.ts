import { Ref } from "vue";
import { IElement } from "../types";

export default (elements: Ref<IElement[]>) => {
    const updateElement = (element: IElement, props: Partial<IElement>) => {
        const i = elements.value.findIndex(item => item.id === element.id);
        for (const key in props) {
            element[key] = props[key];
        }
        elements.value[i] = element;
    };

    return {
        updateElement
    };
};
