<template>
    <FontFamily :elements="elements" />
    <FontSize :elements="elements" />
    <a-divider class="ppt-tool-divider" type="vertical" />

    <Bold :elements="elements" />

    <Italic :elements="elements" />

    <Underline :elements="elements" />

    <Strikout :elements="elements" />

    <FontColor />
    <a-divider class="ppt-tool-divider" type="vertical" />

    <Align :elements="elements" />

    <LineHeight :elements="elements" />
</template>

<script lang="ts" setup>
import { PropType, toRefs } from "vue";
import { IPPTElement } from "@/types/element";
import FontSize from "./FontSize.vue";
import Bold from "./Bold.vue";
import Italic from "./Italic.vue";
import Underline from "./UnderLine.vue";
import Strikout from "./Strikout.vue";
import FontColor from "./FontColor.vue";
import FontFamily from "./FontFamily.vue";
import Align from "./Align.vue";
import LineHeight from "./LineHeight.vue";
// import Editor from "@/plugins/editor";

// const instance = inject<Ref<Editor>>("instance");

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const { elements } = toRefs(props);
</script>

<style lang="scss" scoped>
.ppt-tool-divider {
    border-left-color: #d9dadb;
    top: 0;
    height: 18px;
}
</style>
