<template>
    <div class="ppt-nav-menu" @keydown.stop="" tabindex="0">
        <FileEdit />

        <Edit :elements="elements" :slideFocus="slideFocus" />

        <Insert />

        <Format :elements="elements" />

        <Arrangement :elements="elements" />

        <SlideShow />

        <Demonstrate :current="current" @onPreview="onPreview" />

        <div class="ppt-electron" @click="openClient()">打开客户端</div>
    </div>
</template>

<script lang="ts" setup>
import { IPPTElement } from "@/types/element";
import { PropType, toRefs } from "vue";
import Edit from "./Edit.vue";
import Insert from "./Insert.vue";
import Format from "./Format.vue";
import Arrangement from "./Arrangement.vue";
import SlideShow from "./SlideShow.vue";
import Demonstrate from "./Demonstrate.vue";
import FileEdit from "./FileEdit.vue";
import customProtocolCheck from "custom-protocol-check";

const props = defineProps({
    slideFocus: {
        type: Boolean,
        default: false
    },
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    },
    current: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(["onPreview"]);

const { slideFocus, elements, current } = toRefs(props);

const isWin = navigator.platform === "Win32" || navigator.platform === "Windows";
const isMac =
    navigator.platform === "Mac68K" ||
    navigator.platform === "MacPPC" ||
    navigator.platform === "Macintosh" ||
    navigator.platform === "MacIntel";
const openClient = () => {
    customProtocolCheck("mpptx://", () => {
        // 下载客户端
        if (isWin) {
            window.location.href = "https://github.com/moneyinto/canvas-ppt/releases/download/release/MPPTX.Setup.1.0.0.exe";
        } else if (isMac) {
            window.location.href = "https://github.com/moneyinto/canvas-ppt/releases/download/release/MPPTX.-1.0.0.dmg";
        }
    });
};

const onPreview = (slideIndex: number) => {
    emit("onPreview", slideIndex);
};
</script>

<style lang="scss">
.ppt-nav-menu {
    height: 26px;
    font-size: 12px;
    background-color: rgb(247, 247, 247);
    border-bottom: 1px solid rgba(65, 70, 75, 0.1);
    user-select: none;
    display: flex;
    align-items: center;
    padding: 0 10px;
    outline: 0;
    .ppt-menu-item {
        padding: 1px 15px 0;
        height: 25px;
        display: flex;
        align-items: center;
        cursor: pointer;
        &:hover {
            background-color: #efefef;
        }
    }
}

.ppt-menu-option {
    display: flex;
    align-items: center;
    font-size: 12px;
    height: 26px;
    width: 140px;
    .disabled {
        opacity: 0.3;
    }
}

.ppt-electron {
    position: absolute;
    right: 15px;
    top: 4px;
    cursor: pointer;
    &:hover {
        opacity: 0.7;
    }
}
</style>
