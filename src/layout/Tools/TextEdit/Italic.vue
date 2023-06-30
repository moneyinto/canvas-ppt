<template>
    <div class="ppt-edit-tools">
       <a-tooltip title="斜体">
            <div
                class="ppt-tool-btn"
                :class="isItalic && 'active'"
                @click="setFontStyle()"
            >
                <SvgIcon name="italicFont" :size="28" />
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, onUnmounted, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTShapeElement, IPPTTableElement, IPPTTextElement } from "@/types/element";
import { IFontData } from "@/types/font";
import SvgIcon from "@/components/SvgIcon.vue";
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
    const operateElements = props.elements.filter(element => (element.type === "text" || element.type === "shape" || element.type === "table")) as (IPPTTextElement | IPPTShapeElement | IPPTTableElement)[];
    if (operateElements.length > 0) {
        isItalic.value = true;
        for (const operateElement of operateElements) {
            if (operateElement.type === "table") {
                const tableSelectCells = instance?.value.stageConfig.tableSelectCells;
                if (tableSelectCells) {
                    const startRow = Math.min(tableSelectCells[0][0], tableSelectCells[1][0]);
                    const endRow = Math.max(tableSelectCells[0][0], tableSelectCells[1][0]);
                    const startCol = Math.min(tableSelectCells[0][1], tableSelectCells[1][1]);
                    const endCol = Math.max(tableSelectCells[0][1], tableSelectCells[1][1]);
                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startCol; col <= endCol; col++) {
                            isItalic.value = operateElement.data[row][col].content.length > 1 ? getContentItalic(operateElement.data[row][col].content) : false;
                            if (!isItalic.value) break;
                        }
                        if (!isItalic.value) break;
                    }
                } else {
                    for (let row = 0; row < operateElement.data.length; row++) {
                        for (let col = 0; col < operateElement.data[row].length; col++) {
                            isItalic.value = operateElement.data[row][col].content.length > 1 ? getContentItalic(operateElement.data[row][col].content) : false;
                            if (!isItalic.value) break;
                        }
                        if (!isItalic.value) break;
                    }
                }
            } else {
                isItalic.value = operateElement.content.length > 1 ? getContentItalic(operateElement.content) : false;
                if (!isItalic.value) break;
            }
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
