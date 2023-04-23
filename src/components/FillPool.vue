<template>
    <div
        class="ppt-fill-content"
        @keydown.stop=""
        tabindex="0"
    >
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

<script lang="ts" setup>
import { THEME_COLOR } from '@/plugins/config/stage';
import ColorBoard from "./ColorBoard.vue";
import Editor from '@/plugins/editor';
import { IPPTAudioElement, IPPTElement, IPPTLineElement, IPPTVideoElement } from '@/types/element';
import { STORAGE_FILL_COLOR } from '@/utils/storage';
import { PropType, Ref, inject, ref, watch } from 'vue';

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    },
    showFillColor: {
        type: Boolean
    },
    cacheFillColor: {
        type: String
    }
});

const emit = defineEmits(["update:showFillColor", "update:cacheFillColor"]);

const instance = inject<Ref<Editor>>("instance");

const currentColor = ref(THEME_COLOR);
const noFill = ref(true);
const opacity = ref(0);

const init = () => {
    const operateElements = props.elements.filter(
        (element) =>
            element.type !== "line" &&
            element.type !== "audio" &&
            element.type !== "video"
    ) as Exclude<
        IPPTElement,
        IPPTLineElement | IPPTAudioElement | IPPTVideoElement
    >[];
    const allHasFill = operateElements.filter((element) => !!element.fill?.color).length === operateElements.length;
    const fill = {
        color: "#000000",
        opacity: 0
    };

    for (const [index, operateElement] of operateElements.entries()) {
        if (index === 0) {
            fill.color = operateElement.fill?.color || "#000000";
            fill.opacity = operateElement.fill?.opacity || 0;
        } else {
            if (fill.color !== operateElement.fill?.color) {
                fill.color = "#000000";
            }

            if (fill.opacity !== operateElement.fill?.opacity) {
                fill.opacity = 0;
            }
        }
    }
    currentColor.value = fill.color;
    noFill.value = !allHasFill;
    opacity.value = fill.opacity;
};

init();

watch(() => props.elements, init);

const setFillColor = (color?: string, noClose?: boolean) => {
    instance?.value.command.executeFill({ color });
    if (!noClose) emit("update:showFillColor", false);
};

const onChangeColor = (
    args: Parameters<(color: string, noClose?: boolean) => void>
) => {
    const [color, noClose] = args;
    setFillColor(color, noClose);
    // 缓存操作颜色
    if (color) {
        localStorage.setItem(STORAGE_FILL_COLOR, color);
        emit("update:cacheFillColor", color);
    }
};

const onOpacityChange = (opacity: number) => {
    instance?.value.command.executeFill({ opacity });
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

.ppt-fill-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
    background-color: #fff;
}
</style>
