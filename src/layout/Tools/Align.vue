<template>
    <div class="ppt-edit-tools">
        <a-tooltip :title="title" :visible="!showAlign && hoverAlign">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverAlign = true"
                @mouseleave="hoverAlign = false"
            >
                <div class="ppt-tool-block" @click="setAlignType(alignType)">
                    <PPTIcon :icon="alignType" :size="26" />
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
                                @click="setAlignType('canvasAlignLeft')"
                            >
                                <PPTIcon icon="canvasAlignLeft" :size="28" />
                                <div class="ppt-align-text">水平居左</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('canvasAlignCenter')"
                            >
                                <PPTIcon icon="canvasAlignCenter" :size="28" />
                                <div class="ppt-align-text">水平居中</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('canvasAlignRight')"
                            >
                                <PPTIcon icon="canvasAlignRight" :size="28" />
                                <div class="ppt-align-text">水平居右</div>
                            </div>

                            <a-divider class="ppt-tool-divider" />
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('canvasVerticalTop')"
                            >
                                <PPTIcon icon="canvasVerticalTop" :size="28" />
                                <div class="ppt-align-text">垂直居上</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('canvasVerticalCenter')"
                            >
                                <PPTIcon
                                    icon="canvasVerticalCenter"
                                    :size="28"
                                />
                                <div class="ppt-align-text">水平居中</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('canvasVerticalBottom')"
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
                                @click="setAlignType('canvasOneAlignCenter')"
                            >
                                <PPTIcon
                                    icon="canvasOneAlignCenter"
                                    :size="28"
                                />
                                <div class="ppt-align-text">水平分布</div>
                            </div>
                            <div
                                class="ppt-align-item"
                                @click="setAlignType('canvasOneVerticalCenter')"
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
                                @click="setAlignType('canvasCenter')"
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
import { computed, inject, ref, Ref } from "vue";
import Editor from "@/plugins/editor";
import { IElementAlignType } from "@/plugins/types";

const instance = inject<Ref<Editor>>("instance");

const alignType = ref<IElementAlignType>("canvasAlignLeft");
const title = computed(() => {
    return {
        canvasAlignCenter: "水平居中",
        canvasAlignLeft: "水平居左",
        canvasAlignRight: "水平居右",
        canvasCenter: "中央对齐",
        canvasOneAlignCenter: "水平分布",
        canvasOneVerticalCenter: "垂直分布",
        canvasVerticalBottom: "垂直居下",
        canvasVerticalCenter: "垂直居中",
        canvasVerticalTop: "垂直居上"
    }[alignType.value];
});

const showAlign = ref(false);
const hoverAlign = ref(false);

const setAlignType = (
    align: IElementAlignType
) => {
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
