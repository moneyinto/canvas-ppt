<template>
    <svg aria-hidden="true" :style="getStyle">
        <use :href="symbolId" :fill="color" />
    </svg>
</template>

<script lang="ts" setup>
import { CSSProperties, computed } from "vue";

const props = defineProps({
    prefix: {
        type: String,
        default: "icon"
    },
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: "#555"
    },
    size: {
        type: [Number, String],
        default: 28
    }
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);

const getStyle = computed((): CSSProperties => {
    const size = `${props.size.toString().replace("px", "")}px`;
    return {
        width: size,
        height: size
    };
});
</script>
