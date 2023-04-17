<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="阴影" :visible="!showShadowColor && hoverShadowColor">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverShadowColor = true"
                @mouseleave="hoverShadowColor = false"
            >
                <div
                    class="ppt-tool-block"
                    @click="setShadowColor(cacheShadowColor)"
                >
                    <PPTIcon icon="shadow" :size="16" />
                    <div
                        class="shadow-color-line"
                        :style="{ background: cacheShadowColor }"
                    ></div>
                </div>

                <a-popover trigger="click" v-model:visible="showShadowColor">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showShadowColor = !showShadowColor"
                    >
                        <PPTIcon icon="down" :size="6" />
                    </div>

                    <template #content>
                        <div class="ppt-shadow-content" @keydown.stop="" tabindex="0">
                            <a-button
                                size="small"
                                block
                                :disabled="noShadow"
                                @click="setShadowColor()"
                            >
                                无阴影
                            </a-button>

                            <ColorBoard
                                :color="currentColor"
                                @change="onChangeColor"
                            />

                            <a-divider style="margin: 12px 0" />

                            <div class="ppt-tool-line">
                                <div class="tool-line-title">模糊程度</div>
                                <div class="tool-line-box">
                                    <a-input-number
                                        class="tool-line-input"
                                        v-model:value="blur"
                                        :min="0"
                                        @change="onBlurChange"
                                    />
                                </div>
                            </div>

                            <div class="ppt-tool-line">
                                <div class="tool-line-title">横向偏移</div>
                                <div class="tool-line-box">
                                    <a-input-number
                                        class="tool-line-input"
                                        v-model:value="offsetX"
                                        @change="onOffsetXChange"
                                    />
                                </div>
                            </div>

                            <div class="ppt-tool-line">
                                <div class="tool-line-title">纵向偏移</div>
                                <div class="tool-line-box">
                                    <a-input-number
                                        class="tool-line-input"
                                        v-model:value="offsetY"
                                        @change="onOffsetYChange"
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
import { inject, PropType, Ref, ref, watch } from "vue";
import ColorBoard from "@/components/ColorBoard.vue";
import PPTIcon from "@/components/Icon.vue";
import { IPPTAudioElement, IPPTElement, IPPTLineElement, IPPTVideoElement } from "@/types/element";
import { STORAGE_SHADOW_COLOR } from "@/utils/storage";
import Editor from "@/plugins/editor";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const instance = inject<Ref<Editor>>("instance");

const cacheShadowColor = ref(
    localStorage.getItem(STORAGE_SHADOW_COLOR) || "#333333"
);
const currentColor = ref("#333333");
const showShadowColor = ref(false);
const hoverShadowColor = ref(false);
const noShadow = ref(true);
const blur = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);

const init = () => {
    const operateElements = props.elements.filter(element => element.type !== "line" && element.type !== "video" && element.type !== "audio") as (Exclude<IPPTElement, IPPTLineElement | IPPTVideoElement | IPPTAudioElement>)[];
    const allHasShadow = operateElements.filter(element => !!element.shadow).length === operateElements.length;
    let shadowColor = "#000000";
    let blurNum = 10;
    let offsetXNum = 4;
    let offsetYNum = 4;
    for (const [index, operateElement] of operateElements.entries()) {
        if (index === 0) {
            shadowColor = operateElement.shadow?.color || "#000000";
            blurNum = operateElement.shadow?.blur || 10;
            offsetXNum = operateElement.shadow?.h || 4;
            offsetYNum = operateElement.shadow?.v || 4;
        } else {
            if (shadowColor !== operateElement.shadow?.color) {
                shadowColor = "#000000";
            }

            if (blurNum !== operateElement.shadow?.blur) {
                blurNum = 10;
            }

            if (offsetXNum !== operateElement.shadow?.h) {
                offsetXNum = 4;
            }

            if (offsetYNum !== operateElement.shadow?.v) {
                offsetYNum = 4;
            }
        }
    }
    currentColor.value = shadowColor;
    noShadow.value = !allHasShadow;
    blur.value = blurNum;
    offsetX.value = offsetXNum;
    offsetY.value = offsetYNum;
};

init();

watch(() => props.elements, init);

const setShadow = () => {
    instance?.value.command.executeShadow({
        v: offsetY.value,
        h: offsetX.value,
        color: currentColor.value,
        blur: blur.value
    });
};

const setShadowColor = (color?: string, noClose?: boolean) => {
    if (color) {
        currentColor.value = color;
        setShadow();
    } else {
        instance?.value.command.executeShadow(undefined);
    }
    if (!noClose) showShadowColor.value = false;
};

const onChangeColor = (
    args: Parameters<(color: string, noClose?: boolean) => void>
) => {
    const [color, noClose] = args;
    setShadowColor(color, noClose);
    // 缓存操作颜色
    if (color) {
        localStorage.setItem(STORAGE_SHADOW_COLOR, color);
        cacheShadowColor.value = color;
    }
};

const onBlurChange = (value: number) => {
    blur.value = value;
    setShadow();
};

const onOffsetXChange = (value: number) => {
    offsetX.value = value;
    setShadow();
};

const onOffsetYChange = (value: number) => {
    offsetY.value = value;
    setShadow();
};
</script>

<style lang="scss" scoped>
.ppt-tool-multifunction {
    .ppt-tool-block {
        padding: 0 5px;
        position: relative;
        .shadow-color-line {
            position: absolute;
            width: 10px;
            height: 10px;
            bottom: 9px;
            left: 7px;
        }
    }
}

.ppt-tool-line {
    .tool-line-title {
        font-size: 12px;
        color: #919397;
    }

    .tool-line-box {
        display: flex;
        align-items: center;

        .tool-line-slider {
            flex: 1;
            margin-left: 0;
        }

        .tool-line-input {
            margin-top: 5px;
            width: 100%;
            :deep(.ant-input-number-input) {
                padding-left: 5px;
            }
        }
    }
}

.ppt-shadow-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}
</style>
