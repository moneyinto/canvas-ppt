<template>
    <div class="ppt-edit-tools">
        <a-popover trigger="click" v-model:visible="showLineHeight">
            <a-tooltip
                title="行距"
                :visible="!showLineHeight && hoverLineHeightPool"
            >
                <div
                    class="ppt-tool-btn"
                    @mouseover="hoverLineHeightPool = true"
                    @mouseleave="hoverLineHeightPool = false"
                >
                    <PPTIcon
                        icon="lineHeight"
                        :size="28"
                    />

                    <PPTIcon icon="down" :size="6" />
                </div>
            </a-tooltip>

            <template #content>
                <div class="ppt-line-height-content" @keydown.stop tabindex="0">
                    <div
                        class="ppt-line-height-item"
                        v-for="height in lineHeightList"
                        :key="height"
                        @click="setLineHeight(height)"
                    >
                        <PPTIcon
                            class="font-line-height-checked"
                            :class="lineHeight === height && 'active'"
                            icon="checked"
                            :size="28"
                        />

                        {{ height }}
                    </div>
                </div>
            </template>
        </a-popover>
    </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, onUnmounted, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTTextElement } from "@/types/element";
import PPTIcon from "@/components/Icon.vue";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const showLineHeight = ref(false);
const hoverLineHeightPool = ref(false);
const lineHeight = ref(2);
const lineHeightList = ref([1, 1.2, 1.6, 2, 2.4, 2.8, 3.2, 4]);

const init = () => {
    const operateElements = props.elements.filter(element => element.type === "text") as IPPTTextElement[];
    if (operateElements.length > 0) {
        for (const [index, operateElement] of operateElements.entries()) {
            if (index === 0) {
                lineHeight.value = operateElement.lineHeight;
            } else {
                if (lineHeight.value !== operateElement.lineHeight) {
                    lineHeight.value = 2;
                    break;
                }
            }
        }
    }
    emitter.emit(EmitterEvents.FONT_LINEHEIGHT_CHANGE, lineHeight.value);
};

init();

watch(() => props.elements, init);

const setLineHeight = (height: number) => {
    showLineHeight.value = false;
    lineHeight.value = height;
    instance?.value.command.executeSetLineHeight(height);
    emitter.emit(EmitterEvents.FONT_LINEHEIGHT_CHANGE, height);
};

const onFontLineHeightChange = (height: number) => {
    lineHeight.value = height;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_LINEHEIGHT_CHANGE, onFontLineHeightChange);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.FONT_LINEHEIGHT_CHANGE, onFontLineHeightChange);
});
</script>

<style lang="scss" scoped>
.ppt-line-height-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}

.ppt-line-height-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 20px 0 12px;
    &:hover {
        background-color: #f6f6f6;
    }
}

.font-line-height-checked {
    visibility: hidden;
    &.active {
        visibility: visible;
    }
}
</style>
