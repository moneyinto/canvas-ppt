<template>
    <div class="ppt-edit-tools">
       <a-tooltip title="删除线">
            <div
                class="ppt-tool-btn"
                :class="isStrikout && 'active'"
                @click="setFontStrikout()"
            >
                <SvgIcon name="strikout" :size="28" />
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
    instance.value.listener.onFontStrikoutChange = (strikout) => {
        isStrikout.value = strikout;
        emitter.emit(EmitterEvents.FONT_STRIKOUT_CHANGE, isStrikout.value);
    };
}

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const isStrikout = ref(false);

const getContentStrikout = (texts: IFontData[]) => {
    let isStrikout = true;
    for (const text of texts) {
        if (!text.strikout && text.value !== "\n") {
            isStrikout = false;
            break;
        }
    }
    return isStrikout;
};

const init = () => {
    const operateElements = props.elements.filter(element => (element.type === "text" || element.type === "shape" || element.type === "table")) as (IPPTTextElement | IPPTShapeElement | IPPTTableElement)[];
    if (operateElements.length > 0) {
        isStrikout.value = true;
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
                            isStrikout.value = operateElement.data[row][col].content.length > 1 ? getContentStrikout(operateElement.data[row][col].content) : false;
                            if (!isStrikout.value) break;
                        }
                        if (!isStrikout.value) break;
                    }
                } else {
                    for (let row = 0; row < operateElement.data.length; row++) {
                        for (let col = 0; col < operateElement.data[row].length; col++) {
                            isStrikout.value = operateElement.data[row][col].content.length > 1 ? getContentStrikout(operateElement.data[row][col].content) : false;
                            if (!isStrikout.value) break;
                        }
                        if (!isStrikout.value) break;
                    }
                }
            } else {
                isStrikout.value = operateElement.content.length > 1 ? getContentStrikout(operateElement.content) : false;
                if (!isStrikout.value) break;
            }
        }
    }
    emitter.emit(EmitterEvents.FONT_STRIKOUT_CHANGE, isStrikout.value);
};

init();

watch(() => props.elements, init);

const setFontStrikout = () => {
    isStrikout.value = !isStrikout.value;
    instance?.value.command.executeSetFontStrikout(isStrikout.value);
    emitter.emit(EmitterEvents.FONT_STRIKOUT_CHANGE, isStrikout.value);
};

const onFontStrikoutChange = (strikout: boolean) => {
    isStrikout.value = strikout;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_STRIKOUT_CHANGE, onFontStrikoutChange);
});

onUnmounted(() => {
    emitter.on(EmitterEvents.FONT_STRIKOUT_CHANGE, onFontStrikoutChange);
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
