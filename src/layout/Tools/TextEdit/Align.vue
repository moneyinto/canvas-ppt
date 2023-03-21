<template>
    <div class="ppt-edit-tools">
        <a-popover trigger="click" v-model:visible="showAlign">
            <a-tooltip
                :title="{left: '左对齐', center: '居中对齐', right: '右对齐'}[alignment]"
                :visible="!showAlign && hoverAlignPool"
            >
                <div
                    class="ppt-tool-btn"
                    @mouseover="hoverAlignPool = true"
                    @mouseleave="hoverAlignPool = false"
                >
                    <PPTIcon
                        :icon="{left: 'alignLeft', center: 'alignCenter', right: 'alignRight'}[alignment]"
                        :size="28"
                    />

                    <PPTIcon icon="down" :size="6" />
                </div>
            </a-tooltip>

            <template #content>
                <div class="ppt-align-content" @keydown.stop tabindex="0">
                    <div
                        class="ppt-align-item"
                        @click="setAlign('left')"
                    >
                        <PPTIcon
                            class="font-alignment"
                            icon="alignLeft"
                            :size="28"
                        />
                        左对齐
                        <PPTIcon
                            class="font-align-checked"
                            :class="alignment === 'left' && 'active'"
                            icon="checked"
                            :size="28"
                        />
                    </div>

                    <div
                        class="ppt-align-item"
                        @click="setAlign('center')"
                    >
                        <PPTIcon
                            class="font-alignment"
                            icon="alignCenter"
                            :size="28"
                        />
                        居中对齐
                        <PPTIcon
                            class="font-align-checked"
                            :class="alignment === 'center' && 'active'"
                            icon="checked"
                            :size="28"
                        />
                    </div>

                    <div
                        class="ppt-align-item"
                        @click="setAlign('right')"
                    >
                        <PPTIcon
                            class="font-alignment"
                            icon="alignRight"
                            :size="28"
                        />
                        右对齐
                        <PPTIcon
                            class="font-align-checked"
                            :class="alignment === 'right' && 'active'"
                            icon="checked"
                            :size="28"
                        />
                    </div>
                </div>
            </template>
        </a-popover>
    </div>
</template>

<script lang="ts" setup>
import { inject, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTTextElement } from "@/types/element";

const instance = inject<Ref<Editor>>("instance");

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const showAlign = ref(false);
const hoverAlignPool = ref(false);
const alignment = ref("left");

const init = () => {
    const operateElements = props.elements.filter(element => element.type === "text") as IPPTTextElement[];
    if (operateElements.length > 0) {
        for (const [index, operateElement] of operateElements.entries()) {
            if (index === 0) {
                alignment.value = operateElement.align;
            } else {
                if (alignment.value !== operateElement.align) {
                    alignment.value = "left";
                    break;
                }
            }
        }
    }
};

init();

watch(() => props.elements, init);

const setAlign = (align: "left" | "center" | "right") => {
    showAlign.value = false;
    alignment.value = align;
    instance?.value.command.executeSetFontAlign(align);
};
</script>

<style lang="scss" scoped>
.ppt-align-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}

.ppt-align-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 45px 0 15px;
    &:hover {
        background-color: #f6f6f6;
    }
}

.font-align-checked {
    position: absolute;
    right: 10px;
    visibility: hidden;
    &.active {
        visibility: visible;
    }
}

.font-alignment {
    margin-right: 2px;
}
</style>
