<template>
    <div
        class="ppt-preview-fixed"
        tabindex="0"
        @keydown.stop="onKeydown"
        ref="screenRef"
    >
    </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onUnmounted, PropType, Ref, ref } from "vue";
import { ISlide } from "@/types/slide";
import Screen from "@/plugins/screen";
import { KeyMap } from "@/plugins/shortCut/keyMap";
import { message } from "ant-design-vue";
import Editor from "@/plugins/editor";

const instance = inject<Ref<Editor>>("instance");

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
const previewSlideIndex = ref(props.startSlideIndex);
const previewSlide = computed(() => props.slides[previewSlideIndex.value]);

let screen: Screen | undefined;
nextTick(() => {
    if (screenRef.value && instance?.value) {
        screen = new Screen(screenRef.value, previewSlide.value, instance.value.history);

        screenRef.value.focus();
    }
});

const updateSlide = () => {
    screen && screen.updateSlide(previewSlide.value);
};

const onKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
        case KeyMap.Left:
        case KeyMap.Up: {
            // 上一页
            if (previewSlideIndex.value > 0) {
                previewSlideIndex.value--;
                updateSlide();
            } else {
                message.warning("已经是第一页了");
            }
            break;
        }
        case KeyMap.Right:
        case KeyMap.Down: {
            // 下一页
            if (previewSlideIndex.value < props.slides.length - 1) {
                previewSlideIndex.value++;
                updateSlide();
            } else {
                message.warning("已经是最后一页了");
            }
            break;
        }
    }

    setTimeout(() => {
        // 重新聚焦
        (event.target as HTMLDivElement).focus();
    }, 100);
};

onUnmounted(() => {
    screen?.destroy();
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
    outline: 0;
}
</style>
