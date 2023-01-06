<template>
    <img class="ppt-icon" :style="{ width: `${size}px` }" :src="iconUrl" alt="">
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';

const porps = defineProps({
    size: {
        type: Number,
        default: 24
    },

    icon: {
        type: String,
        required: true
    }
});

const { size, icon } = toRefs(porps);

const icons: { [key: string]: string } = {
    undo: new URL("@/assets/icons/undo.svg", import.meta.url).href,
    redo: new URL("@/assets/icons/redo.svg", import.meta.url).href,
    cut: new URL("@/assets/icons/cut.svg", import.meta.url).href,
    copy: new URL("@/assets/icons/copy.svg", import.meta.url).href,
    paste: new URL("@/assets/icons/paste.svg", import.meta.url).href,
    all: new URL("@/assets/icons/all.svg", import.meta.url).href,
    plus: new URL("@/assets/icons/plus.svg", import.meta.url).href,
    minus: new URL("@/assets/icons/minus.svg", import.meta.url).href,
    fit: new URL("@/assets/icons/fit.svg", import.meta.url).href
};

const iconUrl = computed(() => icons[icon.value]);
</script>

<style scoped>
.ppt-icon {
    /* display: block; */
    vertical-align: top;
}
</style>
