<template>
    <div class="ppt-preview-fixed">
        <div
            class="ppt-preview-box"
            :style="{
                width: screenWidth + 'px',
                height: screenHeight + 'px'
            }"
            ref="screenRef"
        ></div>
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, PropType, ref } from "vue";
import { VIEWRATIO } from "@/plugins/config/stage";
import { ISlide } from "@/types/slide";
import Screen from "@/plugins/screen";

const props = defineProps({
    slides: {
        type: Object as PropType<ISlide[]>,
        required: true
    },
    startSlideIndex: {
        type: Number,
        default: 0
    }
});

const screenRef = ref<HTMLDivElement>();
const screenWidth = ref(window.innerWidth);
const screenHeight = ref(screenWidth.value * VIEWRATIO);
nextTick(() => {
    if (screenHeight.value > window.innerHeight) {
        screenHeight.value = window.innerHeight;
        screenWidth.value = screenHeight.value / VIEWRATIO;
    }
});

const previewSlideIndex = ref(props.startSlideIndex);
const previewSlide = computed(() => props.slides[previewSlideIndex.value]);

let screen: Screen | undefined;
nextTick(() => {
    if (screenRef.value) {
        screen = new Screen(screenRef.value, previewSlide.value);
    }
});
</script>

<style lang="scss" scoped>
.ppt-preview-fixed {
    position: fixed;
    z-index: 10000;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ppt-preview-box {
    background-color: #fff;
}
</style>
