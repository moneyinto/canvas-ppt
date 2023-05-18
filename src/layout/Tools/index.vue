<template>
    <div class="ppt-tools" @keydown.stop="" tabindex="0">
        <div class="ppt-tools-fixed">
            <AddPPT />

            <a-divider class="ppt-tool-divider" type="vertical" />
            <div class="ppt-edit-tools">
                <a-tooltip title="保存">
                    <div
                        class="ppt-tool-btn"
                        @click="save()"
                    >
                        &nbsp;
                        <PPTIcon icon="save" :size="16" />
                        &nbsp;
                    </div>
                </a-tooltip>
            </div>

            <a-divider class="ppt-tool-divider" type="vertical" />
            <Edit />

            <a-divider class="ppt-tool-divider" type="vertical" />
        </div>
        <Insert />

        <a-divider class="ppt-tool-divider" v-if="showEvert || showAlign" type="vertical" />
        <Align v-if="showAlign" :elements="elements" />
        <Evert v-if="showEvert || showImageEdit" />

        <a-divider class="ppt-tool-divider" v-if="showTextEidt" type="vertical" />
        <TextEdit v-if="showTextEidt" :elements="elements" />

        <a-divider class="ppt-tool-divider" v-if="showBorder || showTextEidt || showShadowColor" type="vertical" />
        <Border v-if="showBorder" :elements="elements" />
        <FillColor v-if="showTextEidt || showImageEdit" :elements="elements" />
        <Shadow v-if="showShadowColor" :elements="elements" />

        <ImageEdit :elements="elements" v-if="showImageEdit" />

        <a-divider class="ppt-tool-divider" type="vertical" />
        <Background />
    </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch, toRefs, inject, Ref } from "vue";
import { IPPTElement } from "@/types/element";
import AddPPT from "./AddPPT.vue";
import Edit from "./Edit.vue";
import Insert from "./Insert.vue";
import FillColor from "./FillColor.vue";
import Shadow from "./Shadow.vue";
import Evert from "./Evert.vue";
import Border from "./Border.vue";
import TextEdit from "./TextEdit/index.vue";
import Align from "./Align.vue";
import ImageEdit from "./ImageEdit.vue";
import Background from "./Background.vue";
import PPTIcon from "@/components/Icon.vue";
import Editor from "@/plugins/editor";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const instance = inject<Ref<Editor>>("instance");

const showBorder = ref(false);
const showShadowColor = ref(false);
const showEvert = ref(false);
const showAlign = ref(false);
const showTextEidt = ref(false);
const showImageEdit = ref(false);

const { elements } = toRefs(props);

watch(elements, () => {
    if (elements.value.length > 0) {
        showBorder.value = elements.value.filter(element => element.type === "line" || element.type === "text" || element.type === "image" || element.type === "latex" || element.type === "chart" || element.type === "table").length > 0;
        showShadowColor.value = elements.value.filter(element => element.type !== "line" && element.type !== "video" && element.type !== "audio").length > 0;
        showEvert.value = elements.value.filter(element => element.type === "shape").length > 0;
        showTextEidt.value = elements.value.filter(element => element.type === "text" || element.type === "shape").length > 0;
        showImageEdit.value = elements.value.filter(element => element.type === "image" || element.type === "latex" || element.type === "chart").length > 0;
        showAlign.value = true;
    } else {
        showBorder.value = false;
        showShadowColor.value = false;
        showEvert.value = false;
        showTextEidt.value = false;
        showAlign.value = false;
        showImageEdit.value = false;
    }
});

const save = async () => {
    console.log(instance?.value.stageConfig.slides);
    // 清理历史记录 初始化历史记录
    await instance?.value.history.clear(true);
    instance?.value.history.getHistorySnapshot();
};
</script>

<style lang="scss" scoped>
.ppt-tools {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: rgb(85, 85, 85);
    background: rgb(247, 247, 247);
    user-select: none;
    height: 36px;
    border-bottom: 1px solid rgba(65, 70, 75, 0.1);
    padding: 0px 10px 0px 0px;
    outline: 0;
    overflow: -moz-scrollbars-none;
    -ms-overflow-style: none;
    overflow-x: auto;

    .ppt-tools-fixed {
        display: flex;
        align-items: center;
        position: sticky;
        left: 0;
        padding-left: 10px;
        height: 100%;
        background-color: rgb(247, 247, 247);
        z-index: 1;
    }
}

.ppt-tool-divider {
    border-left-color: #d9dadb;
    top: 0;
    height: 18px;
}
</style>

<style lang="scss">
.ppt-edit-tools {
    height: 28px;
    display: flex;
    align-items: center;
}

.ppt-tool-btn {
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    font-size: 12px;
    height: 28px;
    cursor: pointer;
    padding: 0 2px;
    &:hover {
        border-color: #ccc;
        // background-color: #ececec;
    }
    &.disabled {
        opacity: .3;
        border-color: transparent;
        cursor: not-allowed;
    }
}

.ppt-tool-multifunction {
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    font-size: 12px;
    height: 28px;
    cursor: pointer;
    .ppt-tool-block {
        padding-left: 5px;
        display: flex;
        align-items: center;
        height: 26px;
        &:hover {
            background-color: #ececec;
        }
    }
    &:hover {
        border-color: #ccc;
        .ppt-tool-dropdown {
            border-color: #ccc;
        }
    }
    .ppt-tool-text {
        margin-top: 1px;
        margin-left: 2px;
        margin-right: 5px;
    }
    .ppt-tool-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        border-left: 1px solid transparent;
        background-color: rgb(247, 247, 247);
        width: 16px;
        height: 26px;
        &:hover {
            background-color: #ececec;
        }
    }
}

.ppt-tools::-webkit-scrollbar {
    display: none;
    height: 0 !important;
}
</style>
