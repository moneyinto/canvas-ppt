<template>
    <FontFamily :element="element" />
    <FontSize :element="element" />
    <a-divider class="ppt-tool-divider" type="vertical" />

    <Bold :element="element" />

    <Italic :element="element" />

    <Underline :element="element" />

    <Strikout :element="element" />

    <FontColor />
    <a-divider class="ppt-tool-divider" type="vertical" />

    <Align :element="element" />
</template>

<script lang="ts" setup>
import { PropType, toRefs } from "vue";
import { IPPTElement } from "@/plugins/types/element";
import FontSize from "./FontSize.vue";
import Bold from "./Bold.vue";
import Italic from "./italic.vue";
import Underline from "./Underline.vue";
import Strikout from "./Strikout.vue";
import FontColor from "./FontColor.vue";
import FontFamily from "./FontFamily.vue";
import Align from "./Align.vue";
// import Editor from "@/plugins/editor";

// const instance = inject<Ref<Editor>>("instance");

const props = defineProps({
    element: {
        type: Object as PropType<IPPTElement | null>,
        required: true
    }
});

const { element } = toRefs(props);
</script>

<style lang="scss" scoped>
.ppt-tool-divider {
    border-left-color: #d9dadb;
    top: 0;
    height: 18px;
}
</style>
