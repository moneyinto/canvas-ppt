<template>
    <div class="ppt-edit-tools">
        <a-popover trigger="click" v-model:visible="showAlign">
            <a-tooltip
                :title="{left: '左对齐', center: '居中对齐', right: '右对齐'}[alignment]"
                :visible="!showAlign && hoverAlignPool"
            >
                <div
                    class="ppt-tool-btn"
                    @mouseover="hoverAlignPool = true"
                    @mouseleave="hoverAlignPool = false"
                >
                    <PPTIcon
                        :icon="{left: 'alignLeft', center: 'alignCenter', right: 'alignRight'}[alignment] || 'alignLeft'"
                        :size="28"
                    />

                    <PPTIcon icon="down" :size="6" />
                </div>
            </a-tooltip>

            <template #content>
                <div class="ppt-align-content" @keydown.stop tabindex="0">
                    <div
                        class="ppt-align-item"
                        @click="setAlign('left')"
                    >
                        <PPTIcon
                            class="font-alignment"
                            icon="alignLeft"
                            :size="28"
                        />
                        左对齐
                        <PPTIcon
                            class="font-align-checked"
                            :class="alignment === 'left' && 'active'"
                            icon="checked"
                            :size="28"
                        />
                    </div>

                    <div
                        class="ppt-align-item"
                        @click="setAlign('center')"
                    >
                        <PPTIcon
                            class="font-alignment"
                            icon="alignCenter"
                            :size="28"
                        />
                        居中对齐
                        <PPTIcon
                            class="font-align-checked"
                            :class="alignment === 'center' && 'active'"
                            icon="checked"
                            :size="28"
                        />
                    </div>

                    <div
                        class="ppt-align-item"
                        @click="setAlign('right')"
                    >
                        <PPTIcon
                            class="font-alignment"
                            icon="alignRight"
                            :size="28"
                        />
                        右对齐
                        <PPTIcon
                            class="font-align-checked"
                            :class="alignment === 'right' && 'active'"
                            icon="checked"
                            :size="28"
                        />
                    </div>
                </div>
            </template>
        </a-popover>
    </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, onUnmounted, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTShapeElement, IPPTTableElement, IPPTTextElement } from "@/types/element";
import PPTIcon from "@/components/Icon.vue";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const showAlign = ref(false);
const hoverAlignPool = ref(false);
const alignment = ref("left");

const init = () => {
    const operateElements = props.elements.filter(element => (element.type === "text" || element.type === "shape" || element.type === "table")) as (IPPTTextElement | IPPTShapeElement | IPPTTableElement)[];
    if (operateElements.length > 0) {
        for (const [index, operateElement] of operateElements.entries()) {
            if (operateElement.type === "table") {
                const tableSelectCells = instance?.value.stageConfig.tableSelectCells;
                if (tableSelectCells) {
                    const startRow = Math.min(tableSelectCells[0][0], tableSelectCells[1][0]);
                    const endRow = Math.max(tableSelectCells[0][0], tableSelectCells[1][0]);
                    const startCol = Math.min(tableSelectCells[0][1], tableSelectCells[1][1]);
                    const endCol = Math.max(tableSelectCells[0][1], tableSelectCells[1][1]);
                    let isDifferent = false;
                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startCol; col <= endCol; col++) {
                            if (index === 0 && row === startRow && col === startCol) {
                                alignment.value = operateElement.data[row][col].align || "center";
                            } else {
                                if (alignment.value !== operateElement.data[row][col].align) {
                                    alignment.value = "left";
                                    isDifferent = true;
                                    break;
                                }
                            }
                        }
                        if (isDifferent) {
                            break;
                        }
                    }
                } else {
                    let isDifferent = false;
                    for (let row = 0; row < operateElement.data.length; row++) {
                        for (let col = 0; col < operateElement.data[row].length; col++) {
                            if (index === 0 && row === 0 && col === 0) {
                                alignment.value = operateElement.data[row][col].align || "center";
                            } else {
                                if (alignment.value !== operateElement.data[row][col].align) {
                                    alignment.value = "left";
                                    isDifferent = true;
                                    break;
                                }
                            }
                        }
                        if (isDifferent) {
                            break;
                        }
                    }
                }
            } else {
                if (index === 0) {
                    alignment.value = operateElement.align || "center";
                } else {
                    if (alignment.value !== operateElement.align) {
                        alignment.value = "left";
                        break;
                    }
                }
            }
        }
    }
};

init();

watch(() => props.elements, init);

const setAlign = (align: "left" | "center" | "right") => {
    showAlign.value = false;
    alignment.value = align;
    instance?.value.command.executeSetFontAlign(align);
    emitter.emit(EmitterEvents.FONT_ALIGN_CHANGE, align);
};

const onFontTextAlignChange = (align: "left" | "center" | "right") => {
    alignment.value = align;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_ALIGN_CHANGE, onFontTextAlignChange);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.FONT_ALIGN_CHANGE, onFontTextAlignChange);
});
</script>

<style lang="scss" scoped>
.ppt-align-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}

.ppt-align-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 45px 0 15px;
    &:hover {
        background-color: #f6f6f6;
    }
}

.font-align-checked {
    position: absolute;
    right: 10px;
    visibility: hidden;
    &.active {
        visibility: visible;
    }
}

.font-alignment {
    margin-right: 2px;
}
</style>
