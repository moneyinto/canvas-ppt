<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="字号" :visible="!showFontSize && hoverFontSize">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverFontSize = true"
                @mouseleave="hoverFontSize = false"
            >
                <div class="ppt-input-box">
                    <a-input
                        class="ppt-size-input"
                        placeholder="字号"
                        v-model:value="fontSize"
                        type="number"
                        :max="72"
                        :min="8"
                        @change="onSizeChange()"
                    ></a-input>
                </div>
                <a-popover trigger="click" v-model:visible="showFontSize">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showFontSize = !showFontSize"
                    >
                        <SvgIcon name="down" :size="6" />
                    </div>

                    <template #content>
                        <div
                            class="ppt-size-content"
                            @keydown.stop
                            tabindex="0"
                        >
                            <div
                                class="ppt-size-item"
                                v-for="size in sizes"
                                :key="size"
                                @click="setFontSize(size)"
                            >
                                <SvgIcon
                                    class="font-size-checked"
                                    :class="fontSize == size && 'active'"
                                    name="checked"
                                    :size="28"
                                />
                                {{ size }}
                            </div>
                        </div>
                    </template>
                </a-popover>
            </div>
        </a-tooltip>

        <a-tooltip title="增大字号">
            <div
                class="ppt-tool-btn"
                @click="plusSize()"
            >
                <SvgIcon name="plusSize" :size="28" />
            </div>
        </a-tooltip>

        <a-tooltip title="减小字号">
            <div
                class="ppt-tool-btn"
                @click="minusSize()"
            >
                <SvgIcon name="minusSize" :size="28" />
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, onUnmounted, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { throttleRAF } from "@/utils";
import { IPPTElement, IPPTShapeElement, IPPTTableElement, IPPTTextElement } from "@/types/element";
import { IFontData } from "@/types/font";
import SvgIcon from "@/components/SvgIcon.vue";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontSizeChange = (size) => {
        fontSize.value = size;
        emitter.emit(EmitterEvents.FONT_SIZE_CHANGE, size);
    };
}

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const showFontSize = ref(false);
const hoverFontSize = ref(false);
const fontSize = ref();

const sizes = ref([
    8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 66, 72
]);

const getContentFontSize = (texts: IFontData[]) => {
    let fontSize: string | number = "";
    for (const text of texts) {
        if (fontSize === "") {
            fontSize = text.fontSize;
        } else if (fontSize !== text.fontSize) {
            // 存在不一样的字体大小 结束循环
            fontSize = "";
            break;
        }
    }
    return fontSize;
};

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
                                fontSize.value = getContentFontSize(operateElement.data[row][col].content);
                            } else {
                                if (fontSize.value !== getContentFontSize(operateElement.data[row][col].content)) {
                                    fontSize.value = "";
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
                                fontSize.value = getContentFontSize(operateElement.data[row][col].content);
                            } else {
                                if (fontSize.value !== getContentFontSize(operateElement.data[row][col].content)) {
                                    fontSize.value = "";
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
                    fontSize.value = getContentFontSize(operateElement.content);
                } else {
                    if (fontSize.value !== getContentFontSize(operateElement.content)) {
                        fontSize.value = "";
                        break;
                    }
                }
            }
        }
    }
    emitter.emit(EmitterEvents.FONT_SIZE_CHANGE, fontSize.value);
};

init();

watch(() => props.elements, init);

const onSizeChange = throttleRAF(() => {
    instance?.value.command.executeSetFontSize(Number(fontSize.value));
    emitter.emit(EmitterEvents.FONT_SIZE_CHANGE, Number(fontSize.value));
});

const setFontSize = (size: number) => {
    showFontSize.value = false;
    fontSize.value = size;
    instance?.value.command.executeSetFontSize(size);
    emitter.emit(EmitterEvents.FONT_SIZE_CHANGE, size);
};

const plusSize = () => {
    instance?.value.command.executeSetFontSize(2, "plus");
    fontSize.value += 2;
    emitter.emit(EmitterEvents.FONT_SIZE_CHANGE, fontSize.value);
};

const minusSize = () => {
    instance?.value.command.executeSetFontSize(2, "minus");
    fontSize.value -= 2;
    emitter.emit(EmitterEvents.FONT_SIZE_CHANGE, fontSize.value);
};

const onFontSizeChange = (size: string | number) => {
    fontSize.value = size;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_SIZE_CHANGE, onFontSizeChange);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.FONT_SIZE_CHANGE, onFontSizeChange);
});
</script>

<style lang="scss" scoped>
.ppt-size-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}

.ppt-size-item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 70px;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 20px 0 12px;
    &:hover {
        background-color: #f6f6f6;
    }
}

.ppt-input-box {
    padding: 0 5px;
    width: 38px;
}

.ppt-size-input {
    padding: 0;
    outline: 0;
    box-shadow: none !important;
    border: none;
    font-size: 12px;
    background-color: transparent;
    text-align: center;
    line-height: 18px;
    height: 18px;
    margin-top: 2px;
}

/* Chrome, Safari, Edge, Opera */
.ppt-size-input::-webkit-outer-spin-button,
.ppt-size-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
.ppt-size-input[type=number] {
    -moz-appearance: textfield;
}

.font-size-checked {
    margin-right: 3px;
    visibility: hidden;
    &.active {
        visibility: visible;
    }
}
</style>
