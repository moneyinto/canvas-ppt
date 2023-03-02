<template>
    <div class="ppt-edit-tools">
       <a-tooltip title="斜体">
            <div
                class="ppt-tool-btn"
                :class="isItalic && 'active'"
                @click="setFontStyle()"
            >
                <PPTIcon icon="italicFont" :size="28" />
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { inject, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTTextElement } from "@/plugins/types/element";
import { IFontData } from "@/plugins/types/font";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontStyleChange = (italic) => {
        isItalic.value = italic;
    };
}

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const isItalic = ref(false);

const getContentItalic = (texts: IFontData[]) => {
    let isItalic = true;
    for (const text of texts) {
        if (text.fontStyle === "normal") {
            isItalic = false;
            break;
        }
    }
    return isItalic;
};

const init = () => {
    const operateElements = props.elements.filter(element => element.type === "text") as IPPTTextElement[];
    if (operateElements.length > 0) {
        for (const [index, operateElement] of operateElements.entries()) {
            if (index === 0) {
                isItalic.value = getContentItalic(operateElement.content);
            } else {
                if (isItalic.value !== getContentItalic(operateElement.content)) {
                    isItalic.value = false;
                    break;
                }
            }
        }
    }
};

init();

watch(() => props.elements, init);

const setFontStyle = () => {
    isItalic.value = !isItalic.value;
    instance?.value.command.executeSetFontStyle(isItalic.value);
};
</script>

<style lang="scss" scoped>
.ppt-tool-btn {
    &.active {
        border-color: #ccc;
        background-color: #ececec;
    }
}
</style>
