<template>
    <div class="ppt-edit-tools">
        <a-tooltip :title="title" :visible="!showAlign && hoverAlign">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverAlign = true"
                @mouseleave="hoverAlign = false"
            >
                <div class="ppt-tool-block" @click="setAlignType(alignType)">
                    <PPTIcon :icon="alignIcon" :size="26" />
                </div>

                <a-popover trigger="click" v-model:visible="showAlign">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showAlign = !showAlign"
                    >
                        <PPTIcon icon="down" :size="6" />
                    </div>

                    <template #content>
                        <div
                            class="ppt-align-content"
                            @keydown.stop=""
                            tabindex="0"
                        >
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('alignLeft')"
                            >
                                <PPTIcon icon="canvasAlignLeft" :size="28" />
                                <div class="ppt-align-text">水平居左</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('alignCenter')"
                            >
                                <PPTIcon icon="canvasAlignCenter" :size="28" />
                                <div class="ppt-align-text">水平居中</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('alignRight')"
                            >
                                <PPTIcon icon="canvasAlignRight" :size="28" />
                                <div class="ppt-align-text">水平居右</div>
                            </div>

                            <a-divider class="ppt-tool-divider" />
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('verticalTop')"
                            >
                                <PPTIcon icon="canvasVerticalTop" :size="28" />
                                <div class="ppt-align-text">垂直居上</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('verticalCenter')"
                            >
                                <PPTIcon
                                    icon="canvasVerticalCenter"
                                    :size="28"
                                />
                                <div class="ppt-align-text">水平居中</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('verticalBottom')"
                            >
                                <PPTIcon
                                    icon="canvasVerticalBottom"
                                    :size="28"
                                />
                                <div class="ppt-align-text">垂直居下</div>
                            </div>

                            <a-divider class="ppt-tool-divider" />
                            <div
                                class="ppt-align-item"
                                :class="elements.length > 1 && 'disabled'"
                                @click="setAlignType('oneAlignCenter', elements.length > 1)"
                            >
                                <PPTIcon
                                    icon="canvasOneAlignCenter"
                                    :size="28"
                                />
                                <div class="ppt-align-text">水平分布</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                :class="elements.length > 1 && 'disabled'"
                                @click="setAlignType('oneVerticalCenter', elements.length > 1)"
                            >
                                <PPTIcon
                                    icon="canvasOneVerticalCenter"
                                    :size="28"
                                />
                                <div class="ppt-align-text">垂直分布</div>
                            </div>

                            <a-divider class="ppt-tool-divider" />
                            <div
                                class="ppt-align-item"
                                :class="elements.length > 1 && 'disabled'"
                                @click="setAlignType('center', elements.length > 1)"
                            >
                                <PPTIcon icon="canvasCenter" :size="28" />
                                <div class="ppt-align-text">中央对齐</div>
                            </div>
                        </div>
                    </template>
                </a-popover>
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { computed, inject, PropType, ref, Ref, toRefs } from "vue";
import Editor from "@/plugins/editor";
import { IElementAlignType } from "@/types";
import { IPPTElement } from "@/types/element";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const { elements } = toRefs(props);

const instance = inject<Ref<Editor>>("instance");

const alignType = ref<IElementAlignType>("alignLeft");
const title = computed(() => {
    return {
        alignCenter: "水平居中",
        alignLeft: "水平居左",
        alignRight: "水平居右",
        center: "中央对齐",
        oneAlignCenter: "水平分布",
        oneVerticalCenter: "垂直分布",
        verticalBottom: "垂直居下",
        verticalCenter: "垂直居中",
        verticalTop: "垂直居上"
    }[alignType.value];
});

const alignIcon = computed(() => {
    return {
        alignCenter: "canvasAlignCenter",
        alignLeft: "canvasAlignLeft",
        alignRight: "canvasAlignRight",
        center: "canvasCenter",
        oneAlignCenter: "canvasOneAlignCenter",
        oneVerticalCenter: "canvasOneVerticalCenter",
        verticalBottom: "canvasVerticalBottom",
        verticalCenter: "canvasVerticalCenter",
        verticalTop: "canvasVerticalTop"
    }[alignType.value];
});

const showAlign = ref(false);
const hoverAlign = ref(false);

const setAlignType = (
    align: IElementAlignType,
    disabled?: boolean
) => {
    if (disabled) return;
    alignType.value = align;
    instance?.value.command.executeSetElementAlign(align);
    showAlign.value = false;
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

.ppt-align-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 120px;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 20px 0 16px;
    &.disabled {
        opacity: .5;
        cursor: not-allowed;
    }
    &:hover {
        background-color: #41464b0d;
    }
    .ppt-align-text {
        margin-top: 2px;
    }
}

.ppt-align-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}

.ppt-tool-divider {
    margin: 4px 0;
}
</style>
