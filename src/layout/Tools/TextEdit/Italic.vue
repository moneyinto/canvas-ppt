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
import { inject, onMounted, onUnmounted, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTShapeElement, IPPTTextElement } from "@/types/element";
import { IFontData } from "@/types/font";
import PPTIcon from "@/components/Icon.vue";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontStyleChange = (italic) => {
        isItalic.value = italic;
    emitter.emit(EmitterEvents.FONT_ITALIC_CHANGE, italic);
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
        if (text.fontStyle === "normal" && text.value !== "\n") {
            isItalic = false;
            break;
        }
    }
    return isItalic;
};

const init = () => {
    const operateElements = props.elements.filter(element => (element.type === "text" || element.type === "shape")) as (IPPTTextElement | IPPTShapeElement)[];
    if (operateElements.length > 0) {
        isItalic.value = true;
        for (const operateElement of operateElements) {
            isItalic.value = operateElement.content.length > 1 ? getContentItalic(operateElement.content) : false;
            if (!isItalic.value) break;
        }
    }
    emitter.emit(EmitterEvents.FONT_ITALIC_CHANGE, isItalic.value);
};

init();

watch(() => props.elements, init);

const setFontStyle = () => {
    isItalic.value = !isItalic.value;
    instance?.value.command.executeSetFontStyle(isItalic.value);
    emitter.emit(EmitterEvents.FONT_ITALIC_CHANGE, isItalic.value);
};

const onFontItalicChange = (italic: boolean) => {
    isItalic.value = italic;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_ITALIC_CHANGE, onFontItalicChange);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.FONT_ITALIC_CHANGE, onFontItalicChange);
});
</script>

<style lang="scss" scoped>
.ppt-tool-btn {
    &.active {
        border-color: #ccc;
        background-color: #ececec;
    }
}
</style>
