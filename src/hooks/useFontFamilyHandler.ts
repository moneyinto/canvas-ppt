import { SYS_FONTS } from "@/plugins/config/font";
import { IPPTElement, IPPTTextElement } from "@/types/element";
import { IFontData } from "@/types/font";
import { isSupportFont } from "@/utils";
import { Ref, computed, ref, watch } from "vue";

export default (elements: Ref<IPPTElement[]>) => {
    const fontFamily = ref("");
    const availableFonts = ref(SYS_FONTS.filter(font => isSupportFont(font.value)));
    const font = computed(() => availableFonts.value.find(font => font.value === fontFamily.value)?.label);

    const getContentFontFamily = (texts: IFontData[]) => {
        let fontFamily = "";
        for (const text of texts) {
            if (fontFamily === "") {
                fontFamily = text.fontFamily;
            } else if (fontFamily !== text.fontFamily) {
                // 存在不一样的字体 结束循环
                fontFamily = "";
                break;
            }
        }
        return fontFamily;
    };

    const initFontFamily = () => {
        const operateElements = elements.value.filter(element => element.type === "text") as IPPTTextElement[];
        if (operateElements.length > 0) {
            for (const [index, operateElement] of operateElements.entries()) {
                if (index === 0) {
                    fontFamily.value = getContentFontFamily(operateElement.content);
                } else {
                    if (fontFamily.value !== getContentFontFamily(operateElement.content)) {
                        fontFamily.value = "";
                        break;
                    }
                }
            }
        }
    };

    initFontFamily();

    watch(elements, initFontFamily);

    return {
        font,
        availableFonts,
        fontFamily
    };
};
