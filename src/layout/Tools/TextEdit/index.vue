<template>
    <FontSize :element="element" />
    <a-divider class="ppt-tool-divider" type="vertical" />
</template>

<script lang="ts" setup>
import { PropType, toRefs } from "vue";
import { IPPTElement } from "@/plugins/types/element";
import FontSize from "./FontSize.vue";
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
