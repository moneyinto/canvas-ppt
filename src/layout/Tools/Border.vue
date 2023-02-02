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
                        <div @keydown.stop="">
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
                                <a-sub-menu class="ppt-sub-popup" title="边框样式">
                                    <a-menu-item class="ppt-sub-menu" @click="updateStyle('solid')">
                                        <div class="ppt-border-solid"></div>
                                    </a-menu-item>
                                    <a-menu-item class="ppt-sub-menu" @click="updateStyle('dashed')">
                                        <div class="ppt-border-dashed"></div>
                                    </a-menu-item>
                                </a-sub-menu>
                                <a-sub-menu title="边框粗细">
                                    <a-menu-item class="ppt-sub-menu" @click="updateWidth(1)">
                                        <div class="ppt-border-solid" style="border-width: 1px;"></div>
                                    </a-menu-item>
                                    <a-menu-item class="ppt-sub-menu" @click="updateWidth(2)">
                                        <div class="ppt-border-solid" style="border-width: 2px;"></div>
                                    </a-menu-item>
                                    <a-menu-item class="ppt-sub-menu" @click="updateWidth(3)">
                                        <div class="ppt-border-solid" style="border-width: 3px;"></div>
                                    </a-menu-item>
                                    <a-menu-item class="ppt-sub-menu" @click="updateWidth(4)">
                                        <div class="ppt-border-solid" style="border-width: 4px;"></div>
                                    </a-menu-item>
                                    <a-menu-item class="ppt-sub-menu" @click="updateWidth(5)">
                                        <div class="ppt-border-solid" style="border-width: 5px;"></div>
                                    </a-menu-item>
                                    <a-menu-item class="ppt-sub-menu" @click="updateWidth(6)">
                                        <div class="ppt-border-solid" style="border-width: 6px;"></div>
                                    </a-menu-item>
                                    <a-menu-item class="ppt-sub-menu" @click="updateWidth(7)">
                                        <div class="ppt-border-solid" style="border-width: 7px;"></div>
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
import { IPPTElement, IPPTShapeElement } from "@/plugins/types/element";
import { STORAGE_BORDER_COLOR } from "@/utils/storage";
import Editor from "@/plugins/editor";

const props = defineProps({
    element: {
        type: Object as PropType<IPPTElement | null>,
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

const init = () => {
    if (props.element) {
        const operateElement = props.element as IPPTShapeElement;
        currentColor.value = operateElement.outline?.color || THEME_COLOR;
        noBorder.value = !operateElement.outline;
        opacity.value = operateElement.outline?.opacity || 0;
    }
};

init();

watch(() => props.element, init);

const setBorderColor = (color?: string, noClose?: boolean) => {
    if (props.element) {
        const operateElement = props.element as IPPTShapeElement;
        instance?.value.command.executeOutline({
            ...(operateElement.outline || {}),
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
    if (props.element) {
        const operateElement = props.element as IPPTShapeElement;
        instance?.value.command.executeOutline({
            ...(operateElement.outline || {}),
            opacity: value
        });
    }
};

const updateStyle = (style: "dashed" | "solid") => {
    if (props.element) {
        const operateElement = props.element as IPPTShapeElement;
        instance?.value.command.executeOutline({
            ...(operateElement.outline || {}),
            style
        });
    }
    showBorder.value = false;
};

const updateWidth = (width: number) => {
    if (props.element) {
        const operateElement = props.element as IPPTShapeElement;
        instance?.value.command.executeOutline({
            ...(operateElement.outline || {}),
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
        margin: 0  -16px !important;
        padding: 0 20px !important;
        font-size: 12px;
        color: #555555;
        &:hover {
            color: #555555;
            background-color: #41464b0d;
        }
    }
    :deep(.ant-menu-submenu-arrow) {
        color: #555555 !important;
        right: 16px;
        &:before, &:after {
            height: 1px;
        }
    }
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
}

.ant-menu-submenu-placement-rightTop .ant-menu-vertical {
    padding: 10px 0 !important;
}
</style>
