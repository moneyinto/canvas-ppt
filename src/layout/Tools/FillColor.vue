<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="填充颜色" :visible="!showFillColor && hoverFillColor">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverFillColor = true"
                @mouseleave="hoverFillColor = false"
            >
                <div
                    class="ppt-tool-block"
                    @click="setFillColor(cacheFillColor)"
                >
                    <PPTIcon icon="fillColor" :size="26" />
                    <div
                        class="fill-color-line"
                        :style="{ background: cacheFillColor }"
                    ></div>
                </div>

                <a-popover trigger="click" v-model:visible="showFillColor">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showFillColor = !showFillColor"
                    >
                        <PPTIcon icon="down" :size="6" />
                    </div>

                    <template #content>
                        <div class="ppt-fill-content" @keydown.stop="" tabindex="0">
                            <a-button
                                size="small"
                                block
                                :disabled="noFill"
                                @click="setFillColor()"
                            >
                                无填充色
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
import { IPPTAudioElement, IPPTElement, IPPTLineElement, IPPTVideoElement } from "@/types/element";
import { STORAGE_FILL_COLOR } from "@/utils/storage";
import Editor from "@/plugins/editor";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const instance = inject<Ref<Editor>>("instance");

const cacheFillColor = ref(
    localStorage.getItem(STORAGE_FILL_COLOR) || THEME_COLOR
);
const currentColor = ref(THEME_COLOR);
const showFillColor = ref(false);
const hoverFillColor = ref(false);
const noFill = ref(true);
const opacity = ref(0);

const init = () => {
    const operateElements = props.elements.filter(element => element.type !== "line" && element.type !== "audio" && element.type !== "video") as (Exclude<IPPTElement, IPPTLineElement | IPPTAudioElement | IPPTVideoElement>)[];
    const allHasFill = operateElements.filter(element => !!element.fill).length === operateElements.length;
    let fill = "#000000";
    let opacityNum = 0;
    for (const [index, operateElement] of operateElements.entries()) {
        if (index === 0) {
            fill = operateElement.fill || "#000000";
            opacityNum = operateElement.fillOpacity || 0;
        } else {
            if (fill !== operateElement.fill) {
                fill = "#000000";
            }

            if (opacityNum !== operateElement.fillOpacity) {
                opacityNum = 0;
            }
        }
    }
    currentColor.value = fill;
    noFill.value = !allHasFill;
    opacity.value = opacityNum;
};

init();

watch(() => props.elements, init);

const setFillColor = (color?: string, noClose?: boolean) => {
    instance?.value.command.executeFillColor(color || "");
    if (!noClose) showFillColor.value = false;
};

const onChangeColor = (
    args: Parameters<(color: string, noClose?: boolean) => void>
) => {
    const [color, noClose] = args;
    setFillColor(color, noClose);
    // 缓存操作颜色
    if (color) {
        localStorage.setItem(STORAGE_FILL_COLOR, color);
        cacheFillColor.value = color;
    }
};

const onOpacityChange = (value: number) => {
    instance?.value.command.executeOpacity(value);
};
</script>

<style lang="scss" scoped>
.ppt-tool-multifunction {
    .ppt-tool-block {
        padding: 0 2px;
        position: relative;
        .fill-color-line {
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

.ppt-fill-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}
</style>
