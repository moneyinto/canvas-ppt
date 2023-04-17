<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="线条颜色" :visible="!showBorder && hoverBorder">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverBorder = true"
                @mouseleave="hoverBorder = false"
            >
                <div
                    class="ppt-tool-block"
                    @click="setBorderColor(cacheBorderColor)"
                >
                    <PPTIcon icon="borderColor" :size="26" />
                    <div
                        class="border-color-line"
                        :style="{ background: cacheBorderColor }"
                    ></div>
                </div>

                <a-popover trigger="click" v-model:visible="showBorder">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showBorder = !showBorder"
                    >
                        <PPTIcon icon="down" :size="6" />
                    </div>

                    <template #content>
                        <div class="ppt-border-content" @keydown.stop="" tabindex="0">
                            <a-button
                                size="small"
                                block
                                :disabled="noBorder"
                                @click="setNoBorder()"
                            >
                                无边框
                            </a-button>

                            <ColorBoard
                                :color="currentColor"
                                @change="onChangeColor"
                            />

                            <a-divider style="margin: 12px 0" />

                            <div class="ppt-tool-opacity">
                                <div class="tool-opacity-title">透明度</div>
                                <div class="tool-opacity-box">
                                    <a-slider
                                        class="tool-opacity-slider"
                                        :min="0"
                                        :max="100"
                                        v-model:value="opacity"
                                        @change="onOpacityChange"
                                    />
                                    <a-input-number
                                        class="tool-opacity-input"
                                        v-model:value="opacity"
                                        :min="0"
                                        :max="100"
                                        :formatter="(value: string) => `${value}%`"
                                        :parser="(value: string) => value.replace('%', '')"
                                        @change="onOpacityChange"
                                    />
                                </div>
                            </div>

                            <a-divider style="margin: 12px 0" />

                            <a-menu class="ppt-border-menu">
                                <a-sub-menu class="ppt-sub-popup">
                                    <template #icon>
                                        <PPTIcon
                                            icon="borderStyle"
                                            :size="30"
                                        />
                                    </template>
                                    <template #title>
                                        <div class="ppt-border-title">
                                            边框样式
                                        </div>
                                    </template>
                                    <a-menu-item
                                        class="ppt-sub-menu"
                                        @click="updateStyle('solid')"
                                    >
                                        <div class="ppt-border-solid"></div>
                                        <PPTIcon
                                            class="border-checked"
                                            :class="borderStyle === 'solid' && 'active'"
                                            icon="checked"
                                            :size="28"
                                        />
                                    </a-menu-item>
                                    <a-menu-item
                                        class="ppt-sub-menu"
                                        @click="updateStyle('dashed')"
                                    >
                                        <div class="ppt-border-dashed"></div>
                                        <PPTIcon
                                            class="border-checked"
                                            :class="borderStyle === 'dashed' && 'active'"
                                            icon="checked"
                                            :size="28"
                                        />
                                    </a-menu-item>
                                </a-sub-menu>
                                <a-sub-menu>
                                    <template #icon>
                                        <PPTIcon
                                            icon="borderWidth"
                                            :size="30"
                                        />
                                    </template>
                                    <template #title>
                                        <div class="ppt-border-title">
                                            边框粗细
                                        </div>
                                    </template>
                                    <a-menu-item
                                        class="ppt-sub-menu"
                                        @click="updateWidth(width)"
                                        v-for="width in borderWidthList"
                                        :key="width"
                                    >
                                        <div
                                            class="ppt-border-solid"
                                            :style="{
                                                borderWidth: width + 'px'
                                            }"
                                        ></div>
                                        <PPTIcon
                                            class="border-checked"
                                            :class="borderWidth === width && 'active'"
                                            icon="checked"
                                            :size="28"
                                        />
                                    </a-menu-item>
                                </a-sub-menu>
                            </a-menu>
                        </div>
                    </template>
                </a-popover>
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { THEME_COLOR } from "@/plugins/config/stage";
import { inject, PropType, Ref, ref, watch } from "vue";
import ColorBoard from "@/components/ColorBoard.vue";
import PPTIcon from "@/components/Icon.vue";
import { IPPTAudioElement, IPPTElement, IPPTElementOutline, IPPTLineElement, IPPTVideoElement } from "@/types/element";
import { STORAGE_BORDER_COLOR } from "@/utils/storage";
import Editor from "@/plugins/editor";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const instance = inject<Ref<Editor>>("instance");

const cacheBorderColor = ref(
    localStorage.getItem(STORAGE_BORDER_COLOR) || THEME_COLOR
);
const currentColor = ref(THEME_COLOR);
const showBorder = ref(false);
const hoverBorder = ref(false);
const noBorder = ref(true);
const opacity = ref(0);
const borderStyle = ref("solid");
const borderWidth = ref(2);

const borderWidthList = ref(
    Array.from({ length: 6 }, (_x: undefined, i) => i + 1)
);

const init = () => {
    const operateElements = props.elements.filter(element => element.type !== "line" && element.type !== "video" && element.type !== "audio") as Exclude<IPPTElement, IPPTLineElement | IPPTVideoElement | IPPTAudioElement>[];
    const allHasOutline = operateElements.filter(element => !!element.outline).length === operateElements.length;
    let outline: Required<IPPTElementOutline> = {
        color: THEME_COLOR,
        opacity: 0,
        style: "solid",
        width: 2
    };
    if (allHasOutline) {
        for (const [index, operateElement] of operateElements.entries()) {
            if (operateElement.outline) {
                if (index === 0) {
                    outline = {
                        ...outline,
                        ...operateElement.outline
                    };
                } else {
                    if (outline.color !== operateElement.outline.color) {
                        outline.color = THEME_COLOR;
                    }

                    if (outline.opacity !== operateElement.outline.opacity) {
                        outline.opacity = 0;
                    }

                    if (outline.style !== operateElement.outline.style) {
                        outline.style = "solid";
                    }

                    if (outline.width !== operateElement.outline.width) {
                        outline.width = 2;
                    }
                }
            }
        }
    }
    currentColor.value = outline.color;
    noBorder.value = !allHasOutline;
    opacity.value = outline.opacity;
    borderStyle.value = outline.style;
    borderWidth.value = outline.width;
};

init();

watch(() => props.elements, init);

const setBorderColor = (color?: string, noClose?: boolean) => {
    if (props.elements.length > 0) {
        instance?.value.command.executeOutline({
            color
        });
    }
    if (!noClose) showBorder.value = false;
};

const setNoBorder = () => {
    instance?.value.command.executeOutline();
};

const onChangeColor = (
    args: Parameters<(color: string, noClose?: boolean) => void>
) => {
    const [color, noClose] = args;
    setBorderColor(color, noClose);
    // 缓存操作颜色
    if (color) {
        localStorage.setItem(STORAGE_BORDER_COLOR, color);
        cacheBorderColor.value = color;
    }
};

const onOpacityChange = (value: number) => {
    if (props.elements.length > 0) {
        instance?.value.command.executeOutline({
            opacity: value
        });
    }
};

const updateStyle = (style: "dashed" | "solid") => {
    if (props.elements.length > 0) {
        instance?.value.command.executeOutline({
            style
        });
    }
    showBorder.value = false;
};

const updateWidth = (width: number) => {
    if (props.elements.length > 0) {
        instance?.value.command.executeOutline({
            width
        });
    }
    showBorder.value = false;
};
</script>

<style lang="scss" scoped>
.ppt-tool-multifunction {
    .ppt-tool-block {
        padding: 0 2px;
        position: relative;
        .border-color-line {
            position: absolute;
            width: 12px;
            height: 3.5px;
            bottom: 4px;
            left: 9px;
        }
    }
}

.ppt-tool-opacity {
    .tool-opacity-title {
        font-size: 12px;
        color: #919397;
    }

    .tool-opacity-box {
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
}

.ppt-border-menu {
    border-right: 0;
    :deep(.ant-menu-submenu-title) {
        height: 36px !important;
        line-height: 36px !important;
        margin: 0 -16px !important;
        padding: 0 16px !important;
        font-size: 12px;
        color: #555555;
        display: flex;
        align-items: center;
        &:hover {
            color: #555555;
            background-color: #41464b0d;
        }
    }
    :deep(.ant-menu-submenu-arrow) {
        color: #555555 !important;
        right: 16px;
        &:before,
        &:after {
            height: 1px;
        }
    }
}

.ppt-border-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}
</style>

<style lang="scss">
.ppt-sub-menu {
    height: 30px !important;
    line-height: 30px !important;
    margin: 0 !important;
    background-color: #ffffff !important;
    &:hover {
        background-color: #41464b0d !important;
    }
    .ant-menu-title-content {
        display: flex;
        align-items: center;
        height: 30px;
        .ppt-border-dashed {
            border-top: 2px dashed #555555;
            flex: 1;
        }

        .ppt-border-solid {
            border-top: 2px solid #555555;
            flex: 1;
        }
    }

    .border-checked {
        margin-left: 10px;
        visibility: hidden;
        &.active {
            visibility: visible;
        }
    }
}

.ant-menu-submenu-placement-rightTop .ant-menu-vertical {
    padding: 10px 0 !important;
}
</style>
