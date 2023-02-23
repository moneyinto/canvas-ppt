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
    fit: new URL("@/assets/icons/fit.svg", import.meta.url).href,
    add: new URL("@/assets/icons/add.svg", import.meta.url).href,
    down: new URL("@/assets/icons/down.svg", import.meta.url).href,
    image: new URL("@/assets/icons/image.svg", import.meta.url).href,
    shape: new URL("@/assets/icons/shape.svg", import.meta.url).href,
    save: new URL("@/assets/icons/save.svg", import.meta.url).href,
    top: new URL("@/assets/icons/top.svg", import.meta.url).href,
    bottom: new URL("@/assets/icons/bottom.svg", import.meta.url).href,
    moveUp: new URL("@/assets/icons/moveUp.svg", import.meta.url).href,
    moveDown: new URL("@/assets/icons/moveDown.svg", import.meta.url).href,
    fillColor: new URL("@/assets/icons/fillColor.svg", import.meta.url).href,
    borderColor: new URL("@/assets/icons/borderColor.svg", import.meta.url).href,
    flipV: new URL("@/assets/icons/flipV.svg", import.meta.url).href,
    flipH: new URL("@/assets/icons/flipH.svg", import.meta.url).href,
    borderWidth: new URL("@/assets/icons/borderWidth.svg", import.meta.url).href,
    borderStyle: new URL("@/assets/icons/borderStyle.svg", import.meta.url).href,
    checked: new URL("@/assets/icons/checked.svg", import.meta.url).href,
    text: new URL("@/assets/icons/text.svg", import.meta.url).href,
    plusSize: new URL("@/assets/icons/plusSize.svg", import.meta.url).href,
    minusSize: new URL("@/assets/icons/minusSize.svg", import.meta.url).href,
    boldFont: new URL("@/assets/icons/boldFont.svg", import.meta.url).href,
    italicFont: new URL("@/assets/icons/italicFont.svg", import.meta.url).href,
    underline: new URL("@/assets/icons/underline.svg", import.meta.url).href,
    strikout: new URL("@/assets/icons/strikout.svg", import.meta.url).href
};

const iconUrl = computed(() => icons[icon.value]);
</script>

<style scoped>
.ppt-icon {
    /* display: block; */
    vertical-align: top;
}
</style>
