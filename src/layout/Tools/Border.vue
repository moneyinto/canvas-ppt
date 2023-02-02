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
</style>
