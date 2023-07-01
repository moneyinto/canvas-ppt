<template>
    <div
        class="ppt-thumbnail-slide"
        :style="{
            width: thumbnailWidth + 'px',
            height: thumbnailWidth * VIEWRATIO + 'px'
        }"
        ref="thumbnail"
    ></div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onUnmounted, PropType, ref } from "vue";
import { VIEWRATIO } from "@/config/stage";
import { ISlide } from "@/types/slide";
import Thumbnail from "@/plugins/screen/thumbnail";
import emitter, { EmitterEvents } from "@/utils/emitter";

const props = defineProps({
    size: {
        type: Number,
        required: true
    },
    slide: {
        type: Object as PropType<ISlide>,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
});

const thumbnail = ref();
const thumbnailWidth = computed(() => props.size);

let thumbnailInstance: Thumbnail | null;

const updateSlide = (updateSlide: ISlide) => {
    if (updateSlide.id === props.slide.id) {
        // 更新
        thumbnailInstance?.updateSlide(updateSlide);
    }
};

nextTick(() => {
    if (thumbnail.value) {
        thumbnailInstance = new Thumbnail(thumbnail.value, props.slide);

        emitter.on(EmitterEvents.UPDATE_THUMBNAIL, updateSlide);
    }
});

onUnmounted(() => {
    emitter.off(EmitterEvents.UPDATE_THUMBNAIL, updateSlide);
});
</script>

<style lang="scss" scoped>
.ppt-thumbnail-slide {
    background-color: #fff;
    cursor: pointer;
    position: relative;
}
</style>
