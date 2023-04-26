<template>
    <div class="ppt-border-content" @keydown.stop="" tabindex="0">
        <a-button
            size="small"
            block
            :disabled="noBorder"
            @click="setNoBorder()"
        >
            无边框
        </a-button>

        <ColorBoard :color="currentColor" @change="onChangeColor" />

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
                    <PPTIcon icon="borderStyle" :size="30" />
                </template>
                <template #title>
                    <div class="ppt-border-title">边框样式</div>
                </template>
                <a-menu-item class="ppt-sub-menu" @click="updateStyle('solid')">
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
                    <PPTIcon icon="borderWidth" :size="30" />
                </template>
                <template #title>
                    <div class="ppt-border-title">边框粗细</div>
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

<script lang="ts" setup>
import { THEME_COLOR } from "@/plugins/config/stage";
import ColorBoard from "./ColorBoard.vue";
import PPTIcon from "@/components/Icon.vue";
import Editor from "@/plugins/editor";
import { PropType, Ref, inject, ref, watch } from "vue";
import { STORAGE_BORDER_COLOR } from "@/utils/storage";
import { IPPTAudioElement, IPPTElement, IPPTElementOutline, IPPTVideoElement } from "@/types/element";

const instance = inject<Ref<Editor>>("instance");

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    },
    cacheBorderColor: {
        type: String
    },
    showBorder: {
        type: Boolean
    }
});

const emit = defineEmits(["update:cacheBorderColor", "update:showBorder"]);
const currentColor = ref(THEME_COLOR);

const noBorder = ref(true);
const opacity = ref(0);
const borderStyle = ref("solid");
const borderWidth = ref(2);

const init = () => {
    const operateElements = props.elements.filter(element => element.type !== "video" && element.type !== "audio") as Exclude<IPPTElement, IPPTVideoElement | IPPTAudioElement>[];
    const allHasOutline = operateElements.filter(element => element.type === "line" || !!element.outline).length === operateElements.length;
    let outline: Required<IPPTElementOutline> = {
        color: THEME_COLOR,
        opacity: 0,
        style: "solid",
        width: 2
    };
    if (allHasOutline) {
        for (const [index, operateElement] of operateElements.entries()) {
            if (operateElement.type === "line") {
                if (index === 0) {
                    outline = {
                        color: operateElement.color,
                        opacity: operateElement.opacity,
                        style: operateElement.style,
                        width: operateElement.borderWidth
                    };
                } else {
                    if (outline.color !== operateElement.color) {
                        outline.color = THEME_COLOR;
                    }

                    if (outline.opacity !== operateElement.opacity) {
                        outline.opacity = 0;
                    }

                    if (outline.style !== operateElement.style) {
                        outline.style = "solid";
                    }

                    if (outline.width !== operateElement.borderWidth) {
                        outline.width = 2;
                    }
                }
            } else if (operateElement.outline) {
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

const borderWidthList = ref(
    Array.from({ length: 6 }, (_x: undefined, i) => i + 1)
);

const setNoBorder = () => {
    instance?.value.command.executeOutline();
};

const setBorderColor = (color?: string, noClose?: boolean) => {
    if (props.elements.length > 0) {
        instance?.value.command.executeOutline({
            color
        });
    }
    if (!noClose) emit("update:showBorder", false);
};

const onChangeColor = (
    args: Parameters<(color: string, noClose?: boolean) => void>
) => {
    const [color, noClose] = args;
    setBorderColor(color, noClose);
    // 缓存操作颜色
    if (color) {
        localStorage.setItem(STORAGE_BORDER_COLOR, color);
        emit("update:cacheBorderColor", color);
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
    emit("update:showBorder", false);
};

const updateWidth = (width: number) => {
    if (props.elements.length > 0) {
        instance?.value.command.executeOutline({
            width
        });
    }
    emit("update:showBorder", false);
};
</script>

<style lang="scss" scoped>
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
    background: #ffffff;
}
</style>
