<template>
    <div class="ppt-edit-tools">
        <a-popover trigger="click" v-model:visible="showFontFamily">
            <a-tooltip
                title="字体"
                :visible="!showFontFamily && hoverFontFamilyPool"
            >
                <div
                    class="ppt-tool-btn"
                    @mouseover="hoverFontFamilyPool = true"
                    @mouseleave="hoverFontFamilyPool = false"
                >
                    <div class="ppt-family-input">
                        {{ font || "字体" }}
                    </div>

                    <SvgIcon name="down" :size="6" />
                </div>
            </a-tooltip>

            <template #content>
                <div class="ppt-family-content" @keydown.stop tabindex="0">
                    <div
                        class="ppt-family-item"
                        v-for="font in availableFonts"
                        :key="font.value"
                        @click="setFontFamily(font.value)"
                    >
                        {{ font.label }}
                        <SvgIcon
                            class="font-family-checked"
                            :class="fontFamily == font.value && 'active'"
                            name="checked"
                            :size="28"
                        />
                    </div>
                </div>
            </template>
        </a-popover>
    </div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, onUnmounted, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTShapeElement, IPPTTableElement, IPPTTextElement } from "@/types/element";
import SvgIcon from "@/components/SvgIcon.vue";
import { IFontData } from "@/types/font";
import { SYS_FONTS } from "@/config/font";
import { isSupportFont } from "@/utils";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontFamilyChange = (font) => {
        fontFamily.value = font;
        emitter.emit(EmitterEvents.FONT_FAMILY_CHANGE, font);
    };
}

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const showFontFamily = ref(false);
const hoverFontFamilyPool = ref(false);

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
                                fontFamily.value = getContentFontFamily(operateElement.data[row][col].content);
                            } else {
                                if (fontFamily.value !== getContentFontFamily(operateElement.data[row][col].content)) {
                                    fontFamily.value = "";
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
                                fontFamily.value = getContentFontFamily(operateElement.data[row][col].content);
                            } else {
                                if (fontFamily.value !== getContentFontFamily(operateElement.data[row][col].content)) {
                                    fontFamily.value = "";
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
                    fontFamily.value = getContentFontFamily(operateElement.content);
                } else {
                    if (fontFamily.value !== getContentFontFamily(operateElement.content)) {
                        fontFamily.value = "";
                        break;
                    }
                }
            }
        }
    }
    emitter.emit(EmitterEvents.FONT_FAMILY_CHANGE, fontFamily.value);
};

init();

watch(() => props.elements, init);

const setFontFamily = (font: string) => {
    showFontFamily.value = false;
    fontFamily.value = font;
    instance?.value.command.executeSetFontFamily(font);
    emitter.emit(EmitterEvents.FONT_FAMILY_CHANGE, font);
};

const onFontFamilyChange = (font: string) => {
    fontFamily.value = font;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_FAMILY_CHANGE, onFontFamilyChange);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.FONT_FAMILY_CHANGE, onFontFamilyChange);
});
</script>

<style lang="scss" scoped>
.ppt-family-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}

.ppt-tool-btn {
    padding: 0 5px;
    width: 100px;
}

.ppt-family-input {
    padding: 0;
    outline: 0;
    box-shadow: none !important;
    border: none;
    font-size: 12px;
    background-color: transparent;
    line-height: 18px;
    height: 18px;
    margin-top: 2px;
    cursor: pointer;
    flex: 1;
}

.ppt-family-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 120px;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 15px;
    &:hover {
        background-color: #f6f6f6;
    }
}

.font-family-checked {
    visibility: hidden;
    &.active {
        visibility: visible;
    }
}
</style>
