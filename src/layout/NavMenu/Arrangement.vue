<template>
    <a-dropdown
        v-model:visible="arrangementVisible"
        overlayClassName="ppt-arrangement-menu"
        placement="bottomLeft"
        trigger="click"
    >
        <div class="ppt-menu-item">排列</div>
        <template #overlay>
            <a-menu triggerSubMenuAction="click">
                <a-sub-menu :disabled="elements.length === 0" key="sub-level">
                    <template #title>
                        <div class="ppt-menu-option">层级排序</div>
                    </template>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="executeMoveTop()"
                        >
                            <SvgIcon name="top" :size="28" />
                            置于顶层
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="executeMoveBottom()"
                        >
                            <SvgIcon name="bottom" :size="28" />
                            置于底层
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="executeMoveUp()"
                        >
                            <SvgIcon name="moveUp" :size="28" />
                            上移一层
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="executeMoveDown()"
                        >
                            <SvgIcon name="moveDown" :size="28" />
                            下移一层
                        </div>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu :disabled="elements.length === 0" key="sub-align">
                    <template #title>
                        <div class="ppt-menu-option">对齐方式</div>
                    </template>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setAlignType('alignLeft')"
                        >
                            <SvgIcon name="canvasAlignLeft" :size="28" />
                            水平居左
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setAlignType('alignCenter')"
                        >
                            <SvgIcon name="canvasAlignCenter" :size="28" />
                            水平居中
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setAlignType('alignRight')"
                        >
                            <SvgIcon name="canvasAlignRight" :size="28" />
                            水平居右
                        </div>
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setAlignType('verticalTop')"
                        >
                            <SvgIcon name="canvasVerticalTop" :size="28" />
                            垂直居上
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setAlignType('verticalCenter')"
                        >
                            <SvgIcon
                                name="canvasVerticalCenter"
                                :size="28"
                            />
                            水平居中
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="setAlignType('verticalBottom')"
                        >
                            <SvgIcon
                                name="canvasVerticalBottom"
                                :size="28"
                            />
                            垂直居下
                        </div>
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            :class="elements.length > 1 && 'disabled'"
                            @click="setAlignType('oneAlignCenter', elements.length > 1)"
                        >
                            <SvgIcon
                                name="canvasOneAlignCenter"
                                :size="28"
                            />
                            水平分布
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            :class="elements.length > 1 && 'disabled'"
                            @click="setAlignType('oneVerticalCenter', elements.length > 1)"
                        >
                            <SvgIcon
                                name="canvasOneVerticalCenter"
                                :size="28"
                            />
                            垂直分布
                        </div>
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            :class="elements.length > 1 && 'disabled'"
                            @click="setAlignType('center', elements.length > 1)"
                        >
                            <SvgIcon name="canvasCenter" :size="28" />
                            中央对齐
                        </div>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu :disabled="elements.length === 0" key="sub-rotate">
                    <template #title>
                        <div class="ppt-menu-option">旋转</div>
                    </template>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="executeClockwise()"
                        >
                            <SvgIcon name="clockwise" :size="28" />
                            顺时针旋转90°
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="executeAntiClockwise()"
                        >
                            <SvgIcon name="anticlockwise" :size="28" />
                            逆时针旋转90°
                        </div>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu :disabled="flipDisabled" key="sub-flip">
                    <template #title>
                        <div class="ppt-menu-option">翻转</div>
                    </template>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="executeFlipH()"
                        >
                            <SvgIcon name="flipH" :size="28" />
                            水平翻转
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div
                            class="ppt-menu-option"
                            @click="executeFlipV()"
                        >
                            <SvgIcon name="flipV" :size="28" />
                            垂直翻转
                        </div>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script lang="ts" setup>
import Editor from "@/plugins/editor";
import { IElementAlignType } from "@/types";
import { IPPTElement } from "@/types/element";
import { PropType, Ref, computed, inject, ref } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const instance = inject<Ref<Editor>>("instance");

const arrangementVisible = ref(false);

const flipDisabled = computed(() => {
    return props.elements.filter(element => element.type === "shape" || element.type === "image" || element.type === "latex" || element.type === "chart").length === 0;
});

const setAlignType = (
    align: IElementAlignType,
    disabled?: boolean
) => {
    if (disabled) return;
    arrangementVisible.value = false;
    instance?.value.command.executeSetElementAlign(align);
};

const executeMoveTop = () => {
    arrangementVisible.value = false;
    instance?.value.command.executeMoveTop();
};

const executeMoveBottom = () => {
    arrangementVisible.value = false;
    instance?.value.command.executeMoveBottom();
};

const executeMoveUp = () => {
    arrangementVisible.value = false;
    instance?.value.command.executeMoveUp();
};

const executeMoveDown = () => {
    arrangementVisible.value = false;
    instance?.value.command.executeMoveDown();
};

const executeClockwise = () => {
    arrangementVisible.value = false;
    instance?.value.command.executeRotate(90, 1);
};

const executeAntiClockwise = () => {
    arrangementVisible.value = false;
    instance?.value.command.executeRotate(90, -1);
};

const executeFlipH = () => {
    arrangementVisible.value = false;
    instance?.value.command.executeFlipH();
};

const executeFlipV = () => {
    arrangementVisible.value = false;
    instance?.value.command.executeFlipV();
};
</script>

<style lang="scss">
.ppt-arrangement-menu {
    .ant-dropdown-menu-submenu-expand-icon {
        top: 6px;
    }
}
</style>
