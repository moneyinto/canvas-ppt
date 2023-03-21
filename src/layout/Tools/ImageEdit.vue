<template>
    <div class="ppt-edit-tools">
        <a-popover trigger="click" v-model:visible="showOpacity">
            <a-tooltip title="图片透明度" :visible="!showOpacity && hoverOpacity">
                <div
                    class="ppt-tool-btn"
                    @mouseover="hoverOpacity = true"
                    @mouseleave="hoverOpacity = false"
                >
                    <PPTIcon icon="opacity" :size="26" />

                    <PPTIcon icon="down" :size="6" />
                </div>
            </a-tooltip>

            <template #content>
                <div class="ppt-opacity-content">
                    <div class="ppt-tool-opacity" @keydown.stop="" tabindex="0">
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
</template>

<script lang="ts" setup>
import { inject, PropType, Ref, ref, watch } from "vue";
import { IPPTElement, IPPTImageElement } from "@/types/element";
import Editor from "@/plugins/editor";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const instance = inject<Ref<Editor>>("instance");

const showOpacity = ref(false);
const hoverOpacity = ref(false);
const opacity = ref(0);

const init = () => {
    const operateElements = props.elements.filter(element => element.type === "image") as IPPTImageElement[];
    let opacityNum = 0;
    for (const [index, operateElement] of operateElements.entries()) {
        if (index === 0) {
            opacityNum = operateElement.opacity || 0;
        } else {
            if (opacityNum !== operateElement.opacity) {
                opacityNum = 0;
            }
        }
    }
    opacity.value = opacityNum;
};

init();

watch(() => props.elements, init);

const onOpacityChange = (value: number) => {
    instance?.value.command.executeImageOpacity(value);
};
</script>

<style lang="scss" scoped>
.ppt-tool-opacity {
    width: 180px;
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

.ppt-opacity-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}
</style>
