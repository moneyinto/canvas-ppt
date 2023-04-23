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
import { computed, inject, nextTick, onUnmounted, PropType, Ref, ref } from "vue";
import { VIEWRATIO } from "@/plugins/config/stage";
import { ISlide } from "@/types/slide";
import Thumbnail from "@/plugins/screen/thumbnail";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { sleep } from "@/utils";
import Editor from "@/plugins/editor";

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

const instance = inject<Ref<Editor>>("instance");

const thumbnail = ref();
const thumbnailWidth = computed(() => props.size);
const slide = computed(() => props.slide);

let thumbnailInstance: Thumbnail | null;

const updateSlide = (updateSlide: ISlide) => {
    if (updateSlide.id === slide.value.id) {
        // 更新
        thumbnailInstance?.updateSlide(updateSlide);
    }
};

nextTick(async () => {
    if (thumbnail.value) {
        // 缩略图存在第一位置，且有视频，初始化存在问题！！
        // 索引值如果为0，且存在视频元素，这里缩略进行延缓加载处理
        if (props.index === 0 && slide.value.elements.filter(element => element.type === "video").length > 0) {
            await sleep(500);
        }
        thumbnailInstance = new Thumbnail(thumbnail.value, slide.value, instance?.value.history);

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
