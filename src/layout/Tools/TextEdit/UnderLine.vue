<template>
    <div class="ppt-edit-tools">
       <a-tooltip title="下划线">
            <div
                class="ppt-tool-btn"
                :class="isUnderLine && 'active'"
                @click="setFontUnderLine()"
            >
                <SvgIcon name="underline" :size="28" />
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
    instance.value.listener.onFontUnderLineChange = (underline) => {
        isUnderLine.value = underline;
    emitter.emit(EmitterEvents.FONT_UNDERLINE_CHANGE, isUnderLine.value);
    };
}

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const isUnderLine = ref(false);

const getContentUnderLine = (texts: IFontData[]) => {
    let isUnderLine = true;
    for (const text of texts) {
        if (!text.underline && text.value !== "\n") {
            isUnderLine = false;
            break;
        }
    }
    return isUnderLine;
};

const init = () => {
    const operateElements = props.elements.filter(element => (element.type === "text" || element.type === "shape" || element.type === "table")) as (IPPTTextElement | IPPTShapeElement | IPPTTableElement)[];
    if (operateElements.length > 0) {
        isUnderLine.value = true;
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
                            isUnderLine.value = operateElement.data[row][col].content.length > 1 ? getContentUnderLine(operateElement.data[row][col].content) : false;
                            if (!isUnderLine.value) break;
                        }
                        if (!isUnderLine.value) break;
                    }
                } else {
                    for (let row = 0; row < operateElement.data.length; row++) {
                        for (let col = 0; col < operateElement.data[row].length; col++) {
                            isUnderLine.value = operateElement.data[row][col].content.length > 1 ? getContentUnderLine(operateElement.data[row][col].content) : false;
                            if (!isUnderLine.value) break;
                        }
                        if (!isUnderLine.value) break;
                    }
                }
            } else {
                isUnderLine.value = operateElement.content.length > 1 ? getContentUnderLine(operateElement.content) : false;
                if (!isUnderLine.value) break;
            }
        }
    }
    emitter.emit(EmitterEvents.FONT_UNDERLINE_CHANGE, isUnderLine.value);
};

init();

watch(() => props.elements, init);

const setFontUnderLine = () => {
    isUnderLine.value = !isUnderLine.value;
    instance?.value.command.executeSetFontUnderLine(isUnderLine.value);
    emitter.emit(EmitterEvents.FONT_UNDERLINE_CHANGE, isUnderLine.value);
};

const onFontUnderLineChange = (underLine: boolean) => {
    isUnderLine.value = underLine;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_UNDERLINE_CHANGE, onFontUnderLineChange);
});

onUnmounted(() => {
    emitter.on(EmitterEvents.FONT_UNDERLINE_CHANGE, onFontUnderLineChange);
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
