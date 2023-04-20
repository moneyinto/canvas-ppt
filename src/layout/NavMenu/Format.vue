<template>
    <a-dropdown
        v-model:visible="formatVisible"
        overlayClassName="ppt-format-menu"
        placement="bottomLeft"
        trigger="click"
    >
        <div class="ppt-menu-item">格式</div>
        <template #overlay>
            <a-menu triggerSubMenuAction="click">
                <a-sub-menu :disabled="fontDisabled" key="sub-text">
                    <template #title>
                        <div class="ppt-menu-option">
                            <div style="width: 28px; height: 26px"></div>
                            &nbsp;&nbsp;文字
                        </div>
                    </template>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="setFontWeight()">
                            <PPTIcon icon="boldFont" :size="28" />
                            &nbsp;&nbsp;加粗
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="setFontStyle()">
                            <PPTIcon icon="italicFont" :size="28" />
                            &nbsp;&nbsp;斜体
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setFontUnderLine()"
                        >
                            <PPTIcon icon="underline" :size="28" />
                            &nbsp;&nbsp;下划线
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="setFontStrikout()">
                            <PPTIcon icon="strikout" :size="28" />
                            &nbsp;&nbsp;中划线
                        </div>
                    </a-menu-item>
                    <a-menu-divider />
                    <a-sub-menu key="sub-font">
                        <template #title>
                            <div class="ppt-menu-option">
                                <div style="width: 28px; height: 26px"></div>
                                &nbsp;&nbsp;字体
                            </div>
                        </template>
                        <a-menu-item
                            v-for="font in availableFonts"
                            :key="font.value"
                        >
                            <div
                                class="ppt-menu-option ppt-menu-checked"
                                @click="setFontFamily(font.value)"
                            >
                                {{ font.label }}

                                <PPTIcon
                                    class="font-checked"
                                    :class="
                                        fontFamily == font.value && 'active'
                                    "
                                    icon="checked"
                                    :size="28"
                                />
                            </div>
                        </a-menu-item>
                    </a-sub-menu>
                    <a-sub-menu key="sub-font-size">
                        <template #title>
                            <div class="ppt-menu-option">
                                <div style="width: 28px; height: 26px"></div>
                                &nbsp;&nbsp;字号
                            </div>
                        </template>
                        <a-menu-item v-for="size in sizes" :key="size">
                            <div
                                class="ppt-menu-option ppt-menu-checked"
                                @click="setFontSize(size)"
                            >
                                {{ size }}

                                <PPTIcon
                                    class="font-checked"
                                    :class="fontSize == size && 'active'"
                                    icon="checked"
                                    :size="28"
                                />
                            </div>
                        </a-menu-item>
                    </a-sub-menu>
                    <a-sub-menu key="sub-font-color">
                        <template #title>
                            <div class="ppt-menu-option">
                                <div style="width: 28px; height: 26px"></div>
                                &nbsp;&nbsp;文本颜色
                            </div>
                        </template>
                        <a-menu-item>
                            <div
                                class="ppt-font-content"
                                @keydown.stop
                                tabindex="0"
                            >
                                <ColorBoard
                                    :color="currentColor"
                                    @change="onChangeColor"
                                />
                            </div>
                        </a-menu-item>
                    </a-sub-menu>
                </a-sub-menu>
                <a-sub-menu :disabled="fontDisabled" key="sub-text-align">
                    <template #title>
                        <div class="ppt-menu-option">
                            <div style="width: 28px; height: 26px"></div>
                            &nbsp;&nbsp;对齐
                        </div>
                    </template>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setTextAlign('left')"
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
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setTextAlign('center')"
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
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-align-item"
                            @click="setTextAlign('right')"
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
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu :disabled="fontDisabled" key="sub-text-lineheight">
                    <template #title>
                        <div class="ppt-menu-option">
                            <div style="width: 28px; height: 26px"></div>
                            &nbsp;&nbsp;行距
                        </div>
                    </template>
                    <a-menu-item
                        v-for="height in lineHeightList"
                        :key="height"
                    >
                        <div
                            class="ppt-menu-option ppt-menu-checked"
                            @click="setLineHeight(height)"
                        >
                            {{ height }}

                            <PPTIcon
                                class="font-checked"
                                :class="
                                    lineHeight == height && 'active'
                                "
                                icon="checked"
                                :size="28"
                            />
                        </div>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script lang="ts" setup>
import {
    computed,
    inject,
    onMounted,
    onUnmounted,
    PropType,
    ref,
    Ref,
    watch
} from "vue";
import Editor from "@/plugins/editor";
import PPTIcon from "@/components/Icon.vue";
import { IPPTElement } from "@/types/element";
import { SYS_FONTS } from "@/plugins/config/font";
import { isSupportFont } from "@/utils";
import emitter, { EmitterEvents } from "@/utils/emitter";
import ColorBoard from "@/components/ColorBoard.vue";
import { THEME_COLOR } from "@/plugins/config/stage";
import { STORAGE_FONT_COLOR } from "@/utils/storage";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const formatVisible = ref(false);
const instance = inject<Ref<Editor>>("instance");
const fontDisabled = ref(true);

// 文本字体
const elements = computed(() => props.elements);
const fontFamily = ref("");
const availableFonts = ref(
    SYS_FONTS.filter((font) => isSupportFont(font.value))
);
const setFontFamily = (font: string) => {
    formatVisible.value = false;
    fontFamily.value = font;
    instance?.value.command.executeSetFontFamily(font);
    emitter.emit(EmitterEvents.FONT_FAMILY_CHANGE, font);
};
const onFontFamilyChange = (font: string) => {
    fontFamily.value = font;
};

// 文本字号
const fontSize = ref();
const sizes = ref([
    8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 66, 72
]);
const setFontSize = (size: number) => {
    formatVisible.value = false;
    fontSize.value = size;
    instance?.value.command.executeSetFontSize(size);
    emitter.emit(EmitterEvents.FONT_SIZE_CHANGE, size);
};
const onFontSizeChange = (size: string | number) => {
    fontSize.value = size;
};

// 文本加粗
const isBold = ref(false);
const setFontWeight = () => {
    formatVisible.value = false;
    isBold.value = !isBold.value;
    instance?.value.command.executeSetFontWeight(isBold.value);
    emitter.emit(EmitterEvents.FONT_WEIGHT_CHANGE, isBold.value);
};
const onFontWeightChange = (bold: boolean) => {
    isBold.value = bold;
};

// 文本斜体
const isItalic = ref(false);
const setFontStyle = () => {
    formatVisible.value = false;
    isItalic.value = !isItalic.value;
    instance?.value.command.executeSetFontStyle(isItalic.value);
    emitter.emit(EmitterEvents.FONT_ITALIC_CHANGE, isItalic.value);
};
const onFontStyleChange = (italic: boolean) => {
    isItalic.value = italic;
};

// 文本下划线
const isUnderLine = ref(false);
const setFontUnderLine = () => {
    formatVisible.value = false;
    isUnderLine.value = !isUnderLine.value;
    instance?.value.command.executeSetFontUnderLine(isUnderLine.value);
    emitter.emit(EmitterEvents.FONT_UNDERLINE_CHANGE, isUnderLine.value);
};
const onFontUnderLineChange = (underLine: boolean) => {
    isUnderLine.value = underLine;
};

// 文本中划线
const isStrikout = ref(false);
const setFontStrikout = () => {
    formatVisible.value = false;
    isStrikout.value = !isStrikout.value;
    instance?.value.command.executeSetFontStrikout(isStrikout.value);
    emitter.emit(EmitterEvents.FONT_STRIKOUT_CHANGE, isStrikout.value);
};
const onFontStrikoutChange = (strikout: boolean) => {
    isStrikout.value = strikout;
};

// 文本颜色
const currentColor = ref(THEME_COLOR);
const cacheFontColor = ref(
    localStorage.getItem(STORAGE_FONT_COLOR) || THEME_COLOR
);
const setFontColor = (color?: string, noClose?: boolean) => {
    instance?.value.command.executeSetFontColor(color || "");
    emitter.emit(EmitterEvents.FONT_COLOR_CHANGE, color || "");
    if (!noClose) formatVisible.value = false;
};
const onChangeColor = (
    args: Parameters<(color: string, noClose?: boolean) => void>
) => {
    const [color, noClose] = args;
    setFontColor(color, noClose);
    // 缓存操作颜色
    if (color) {
        localStorage.setItem(STORAGE_FONT_COLOR, color);
        cacheFontColor.value = color;
    }
};
const onFontColorChange = (color: string) => {
    currentColor.value = color;
    cacheFontColor.value = color;
};

// 文本对齐
const alignment = ref("left");
const setTextAlign = (align: "left" | "center" | "right") => {
    formatVisible.value = false;
    alignment.value = align;
    instance?.value.command.executeSetFontAlign(align);
    emitter.emit(EmitterEvents.FONT_ALIGN_CHANGE, align);
};
const onTextAlignChange = (align: "left" | "center" | "right") => {
    alignment.value = align;
};

const lineHeightList = ref([1, 1.2, 1.6, 2, 2.4, 2.8, 3.2, 4]);
const lineHeight = ref(2);
const setLineHeight = (height: number) => {
    formatVisible.value = false;
    lineHeight.value = height;
    instance?.value.command.executeSetLineHeight(height);
    emitter.emit(EmitterEvents.FONT_LINEHEIGHT_CHANGE, height);
};
const onLineHeightChange = (height: number) => {
    lineHeight.value = height;
};

watch(elements, () => {
    if (elements.value.length > 0) {
        fontDisabled.value = elements.value.filter((element) => element.type === "text").length === 0;
    } else {
        fontDisabled.value = true;
    }
});

onMounted(() => {
    emitter.on(EmitterEvents.FONT_FAMILY_CHANGE, onFontFamilyChange);
    emitter.on(EmitterEvents.FONT_SIZE_CHANGE, onFontSizeChange);
    emitter.on(EmitterEvents.FONT_WEIGHT_CHANGE, onFontWeightChange);
    emitter.on(EmitterEvents.FONT_ITALIC_CHANGE, onFontStyleChange);
    emitter.on(EmitterEvents.FONT_UNDERLINE_CHANGE, onFontUnderLineChange);
    emitter.on(EmitterEvents.FONT_STRIKOUT_CHANGE, onFontStrikoutChange);
    emitter.on(EmitterEvents.FONT_COLOR_CHANGE, onFontColorChange);
    emitter.on(EmitterEvents.FONT_ALIGN_CHANGE, onTextAlignChange);
    emitter.on(EmitterEvents.FONT_LINEHEIGHT_CHANGE, onLineHeightChange);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.FONT_FAMILY_CHANGE, onFontFamilyChange);
    emitter.off(EmitterEvents.FONT_SIZE_CHANGE, onFontSizeChange);
    emitter.off(EmitterEvents.FONT_WEIGHT_CHANGE, onFontWeightChange);
    emitter.off(EmitterEvents.FONT_ITALIC_CHANGE, onFontStyleChange);
    emitter.off(EmitterEvents.FONT_UNDERLINE_CHANGE, onFontUnderLineChange);
    emitter.off(EmitterEvents.FONT_STRIKOUT_CHANGE, onFontStrikoutChange);
    emitter.off(EmitterEvents.FONT_COLOR_CHANGE, onFontColorChange);
    emitter.off(EmitterEvents.FONT_ALIGN_CHANGE, onTextAlignChange);
    emitter.on(EmitterEvents.FONT_LINEHEIGHT_CHANGE, onLineHeightChange);
});
</script>

<style lang="scss">
.ant-dropdown-menu-item-disabled .ppt-icon {
    opacity: 0.4;
}

.ppt-menu-checked {
    justify-content: space-between;
}

.ppt-format-menu {
    .ant-dropdown-menu-submenu-expand-icon {
        top: 6px;
    }

    .ppt-menu-divider {
        margin: 4px 0;
    }

    .font-checked {
        visibility: hidden;
        &.active {
            visibility: visible;
        }
    }

    .ppt-font-content {
        outline: 0;
        background-color: #fff;
    }

    .font-align-checked {
        position: absolute;
        right: 5px;
        visibility: hidden;
        &.active {
            visibility: visible;
        }
    }

    .font-alignment {
        margin-right: 2px;
    }
}
</style>
