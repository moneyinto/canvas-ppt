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
                            <SvgIcon name="boldFont" :size="28" />
                            &nbsp;&nbsp;加粗
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="setFontStyle()">
                            <SvgIcon name="italicFont" :size="28" />
                            &nbsp;&nbsp;斜体
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setFontUnderLine()"
                        >
                            <SvgIcon name="underline" :size="28" />
                            &nbsp;&nbsp;下划线
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="setFontStrikout()">
                            <SvgIcon name="strikout" :size="28" />
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

                                <SvgIcon
                                    class="font-checked"
                                    :class="
                                        fontFamily == font.value && 'active'
                                    "
                                    name="checked"
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

                                <SvgIcon
                                    class="font-checked"
                                    :class="fontSize == size && 'active'"
                                    name="checked"
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
                            <SvgIcon
                                class="font-alignment"
                                name="alignLeft"
                                :size="28"
                            />
                            左对齐
                            <SvgIcon
                                class="font-align-checked"
                                :class="alignment === 'left' && 'active'"
                                name="checked"
                                :size="28"
                            />
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setTextAlign('center')"
                        >
                            <SvgIcon
                                class="font-alignment"
                                name="alignCenter"
                                :size="28"
                            />
                            居中对齐
                            <SvgIcon
                                class="font-align-checked"
                                :class="alignment === 'center' && 'active'"
                                name="checked"
                                :size="28"
                            />
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setTextAlign('right')"
                        >
                            <SvgIcon
                                class="font-alignment"
                                name="alignRight"
                                :size="28"
                            />
                            右对齐
                            <SvgIcon
                                class="font-align-checked"
                                :class="alignment === 'right' && 'active'"
                                name="checked"
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
                    <a-menu-item v-for="height in lineHeightList" :key="height">
                        <div
                            class="ppt-menu-option ppt-menu-checked"
                            @click="setLineHeight(height)"
                        >
                            {{ height }}

                            <SvgIcon
                                class="font-checked"
                                :class="lineHeight == height && 'active'"
                                name="checked"
                                :size="28"
                            />
                        </div>
                    </a-menu-item>
                </a-sub-menu>
                <a-menu-divider />
                <a-sub-menu
                    :disabled="
                        fontDisabled &&
                        shapeDisabled &&
                        imageDisabled &&
                        latexDisabled &&
                        chartDisabled
                    "
                    key="sub-border"
                >
                    <template #title>
                        <div class="ppt-menu-option">
                            <div style="width: 28px; height: 26px"></div>
                            &nbsp;&nbsp;边框设置
                        </div>
                    </template>
                    <a-menu-item>
                        <div class="ppt-border-box" @keydown.stop tabindex="0">
                            <BorderPool :elements="elements" />
                        </div>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu
                    :disabled="
                        fontDisabled &&
                        shapeDisabled &&
                        imageDisabled &&
                        latexDisabled &&
                        chartDisabled
                    "
                    key="sub-fill"
                >
                    <template #title>
                        <div class="ppt-menu-option">
                            <div style="width: 28px; height: 26px"></div>
                            &nbsp;&nbsp;填充设置
                        </div>
                    </template>
                    <a-menu-item>
                        <div class="ppt-fill-box" @keydown.stop tabindex="0">
                            <FillPool
                                :elements="elements"
                            />
                        </div>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu
                    :disabled="
                        imageDisabled &&
                        latexDisabled &&
                        chartDisabled
                    "
                    key="sub-opacity"
                >
                    <template #title>
                        <div class="ppt-menu-option">
                            <SvgIcon
                                name="opacity"
                                :size="28"
                            />
                            &nbsp;&nbsp;透明度
                        </div>
                    </template>
                    <a-menu-item>
                        <div class="ppt-opacity-box" @keydown.stop tabindex="0">
                            <a-slider
                                class="tool-opacity-slider"
                                :min="0"
                                :max="100"
                                v-model:value="opacity"
                                @change="setOpacity"
                            />
                            <a-input-number
                                class="tool-opacity-input"
                                v-model:value="opacity"
                                :min="0"
                                :max="100"
                                :formatter="(value: string) => `${value}%`"
                                :parser="(value: string) => value.replace('%', '')"
                                @change="setOpacity"
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
    inject,
    onMounted,
    onUnmounted,
    PropType,
    ref,
    Ref,
    watch
} from "vue";
import Editor from "@/plugins/editor";
import SvgIcon from "@/components/SvgIcon.vue";
import { IPPTElement } from "@/types/element";
import { SYS_FONTS } from "@/config/font";
import { isSupportFont } from "@/utils";
import emitter, { EmitterEvents } from "@/utils/emitter";
import ColorBoard from "@/components/ColorBoard.vue";
import { THEME_COLOR } from "@/config/stage";
import { STORAGE_FONT_COLOR } from "@/utils/storage";
import BorderPool from "@/components/BorderPool.vue";
import FillPool from "@/components/FillPool.vue";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const formatVisible = ref(false);
const instance = inject<Ref<Editor>>("instance");
const fontDisabled = ref(true);
const shapeDisabled = ref(true);
const imageDisabled = ref(true);
const latexDisabled = ref(true);
const chartDisabled = ref(true);

// 文本字体
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

const opacity = ref(0);
const setOpacity = (value: number) => {
    opacity.value = value;
    instance?.value.command.executeImageOpacity(value);
};

watch(() => props.elements, () => {
    if (props.elements.length > 0) {
        fontDisabled.value = props.elements.filter((element) => element.type === "text").length === 0;
        shapeDisabled.value = props.elements.filter((element) => element.type === "shape").length === 0;
        imageDisabled.value = props.elements.filter((element) => element.type === "image").length === 0;
        latexDisabled.value = props.elements.filter((element) => element.type === "latex").length === 0;
        imageDisabled.value = props.elements.filter((element) => element.type === "image").length === 0;
    } else {
        fontDisabled.value = true;
        shapeDisabled.value = true;
        imageDisabled.value = true;
        latexDisabled.value = true;
        imageDisabled.value = true;
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
    emitter.off(EmitterEvents.FONT_LINEHEIGHT_CHANGE, onLineHeightChange);
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
        margin: -5px -12px;
        padding: 1px 12px 10px;
        outline: 0;
        background-color: #fff;
    }

    .ppt-border-box, .ppt-fill-box, .ppt-opacity-box {
        padding: 1px;
        background-color: #fff;
    }

    .ppt-opacity-box {
        margin: -5px -12px;
        padding: 5px 18px;
        background-color: #fff;
        width: 200px;
        display: flex;
        align-items: center;

        .tool-opacity-slider {
            flex: 1;
            margin-left: 0;
        }

        .tool-opacity-input {
            width: 70px;
            margin-left: 5px;
            :deep(.ant-input-number-input) {
                padding-left: 5px;
            }
        }
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
