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
import { STORAGE_FILL_COLOR } from "@/utils/storage";
import Editor from "@/plugins/editor";

const props = defineProps({
    element: {
        type: Object as PropType<IPPTElement | null>,
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

const init = () => {
    if (props.element) {
        const operateElement = props.element as IPPTShapeElement;
        currentColor.value = operateElement.fill;
        noFill.value = !operateElement.fill;
    }
};

init();

watch(() => props.element, init);

const setFillColor = (color?: string) => {
    if (props.element) {
        const element = props.element as IPPTShapeElement;
        const newElement = {
            ...element,
            fill: color || ""
        };
        instance?.value.stageConfig.setOperateElement(newElement);
        instance?.value.stageConfig.updateElement(newElement);
        instance?.value.history.add();
        instance?.value.stageConfig.resetCheckDrawView();
    }
    showFillColor.value = false;
};

const onChangeColor = (color: string | undefined) => {
    setFillColor(color);
    // 缓存操作颜色
    if (color) {
        localStorage.setItem(STORAGE_FILL_COLOR, color);
        cacheFillColor.value = color;
    }
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
            height: 2.5px;
            bottom: 5px;
            left: 9px;
        }
    }
}
</style>
