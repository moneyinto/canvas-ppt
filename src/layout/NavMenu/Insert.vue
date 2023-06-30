<template>
    <a-dropdown
        v-model:visible="insertVisible"
        overlayClassName="ppt-insert-menu"
        placement="bottomLeft"
        trigger="click"
    >
        <div class="ppt-menu-item">插入</div>
        <template #overlay>
            <a-menu triggerSubMenuAction="click">
                <a-sub-menu key="sub-image">
                    <template #title>
                        <div class="ppt-menu-option">
                            <SvgIcon name="image" :size="28" />
                            &nbsp;&nbsp;图片
                        </div>
                    </template>
                    <a-menu-item>
                        <FileInput
                            class="ppt-menu-option"
                            accept="image/*"
                            @change="insertImageElement"
                        >
                            <SvgIcon name="upload" :size="28" />&nbsp;&nbsp;本地上传
                        </FileInput>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu popupClassName="ppt-shape-box" key="sub-shape">
                    <template #title>
                        <div class="ppt-menu-option">
                            <SvgIcon name="shape" :size="28" />
                            &nbsp;&nbsp;形状
                        </div>
                    </template>
                    <a-menu-item>
                        <ShapePool @selectShape="insertShapeElement" />
                    </a-menu-item>
                </a-sub-menu>
                <a-menu-item>
                    <div class="ppt-menu-option" @click="insertTextElement">
                        <SvgIcon name="text" :size="28" />
                        &nbsp;&nbsp;文本框
                    </div>
                </a-menu-item>
                <a-sub-menu key="sub-chart">
                    <template #title>
                        <div class="ppt-menu-option">
                            <SvgIcon name="chart" :size="28" />
                            &nbsp;&nbsp;图表
                        </div>
                    </template>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="openChart('bar', true)">
                            <SvgIcon name="bar_h" :size="28" />
                            &nbsp;&nbsp;条形图
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="openChart('bar')">
                            <SvgIcon name="bar_v" :size="28" />
                            &nbsp;&nbsp;柱状图
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="openChart('line')">
                            <SvgIcon name="line" :size="28" />
                            &nbsp;&nbsp;折线图
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="openChart('pie')">
                            <SvgIcon name="pie" :size="28" />
                            &nbsp;&nbsp;饼状图
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="openChart('funnel')">
                            <SvgIcon name="funnel" :size="28" />
                            &nbsp;&nbsp;漏斗图
                        </div>
                    </a-menu-item>
                </a-sub-menu>
                <a-menu-item>
                    <div class="ppt-menu-option" @click="openLatex()">
                        <SvgIcon name="latex" :size="28" />
                        &nbsp;&nbsp;公式
                    </div>
                </a-menu-item>
                <a-sub-menu key="sub-video">
                    <template #title>
                        <div class="ppt-menu-option">
                            <SvgIcon name="video" :size="28" />
                            &nbsp;&nbsp;视频
                        </div>
                    </template>
                    <a-menu-item>
                        <FileInput
                            class="ppt-menu-option"
                            accept="video/*"
                            @change="insertVideoElement"
                        >
                            <SvgIcon name="upload" :size="28" />&nbsp;&nbsp;本地上传
                        </FileInput>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="sub-audio">
                    <template #title>
                        <div class="ppt-menu-option">
                            &nbsp;
                            <SvgIcon name="audio" :size="16" />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;音频
                        </div>
                    </template>
                    <a-menu-item>
                        <FileInput
                            class="ppt-menu-option"
                            accept="audio/*"
                            @change="insertAudioElement"
                        >
                            <SvgIcon name="upload" :size="28" />&nbsp;&nbsp;本地上传
                        </FileInput>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script lang="ts" setup>
import { inject, ref, Ref } from "vue";
import Editor from "@/plugins/editor";
import ShapePool from "@/components/ShapePool.vue";
import FileInput from "@/components/FileInput.vue";
import useInsertElement from "@/hooks/useInsertElement";
import SvgIcon from "@/components/SvgIcon.vue";
import { ChartType } from "@/types/element";
import emitter, { EmitterEvents } from "@/utils/emitter";

const insertVisible = ref(false);
const instance = inject<Ref<Editor>>("instance");

const {
    insertImageElement,
    insertShapeElement,
    insertTextElement,
    insertVideoElement,
    insertAudioElement
} = useInsertElement(instance, insertVisible);

const openChart = (
    args: ChartType,
    transformation?: boolean
) => {
    insertVisible.value = false;
    emitter.emit(EmitterEvents.OPEN_CHART, { args, transformation });
};

const openLatex = () => {
    insertVisible.value = false;
    emitter.emit(EmitterEvents.OPEN_LATEX);
};
</script>

<style lang="scss">
.ant-dropdown-menu-item-disabled .ppt-icon {
    opacity: 0.4;
}

.ppt-insert-menu {
    .ant-dropdown-menu-submenu-expand-icon {
        top: 6px;
    }

    .ppt-shape-box {
        .ant-dropdown-menu-item {
            background-color: #fff;
        }
    }
}
</style>
