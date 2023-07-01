<template>
    <div
        class="ppt-preview-fixed"
        tabindex="0"
        @keydown.stop="onKeydown"
        ref="screenRef"
    >
        <div
            class="ppt-preview-tools"
            :class="hiddenTool && 'hidden-preview-tools'"
            @mousedown.stop
        >
            <div class="preview-tools-btn" @click="prev()">
                <SvgIcon name="leftArrow" color="#eee" :size="11" />
            </div>
            <div class="ppt-preview-size">
                {{ previewSlideIndex + 1 }} / {{ props.slides.length }}
            </div>
            <div class="preview-tools-btn" @click="next()">
                <SvgIcon name="rightArrow" color="#eee" :size="11" />
            </div>
            <div
                class="preview-tools-btn"
                :class="whiteboardVisible && 'active'"
                @click="whiteboardVisible = !whiteboardVisible"
            >
                <SvgIcon style="color: #eee;" name="pencil" :size="20" />
                <div class="preview-tools-text">画笔</div>
            </div>
            <div class="preview-tools-btn" @click="endPreview()">
                <SvgIcon name="endPreview" color="#CD4747" :size="24" />
                <div class="preview-tools-text">结束</div>
            </div>
        </div>

        <div
            class="white-board-box"
            :class="whiteboardVisible && 'ppt-can-write'"
        >
            <MWhiteboard
                :disabled="!whiteboardVisible"
                :options="options"
                ref="whiteboard"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    computed,
    nextTick,
    onUnmounted,
    PropType,
    ref
} from "vue";
import { ISlide } from "@/types/slide";
import Screen from "@/plugins/screen";
import { KeyMap } from "@/plugins/shortCut/keyMap";
import { message } from "ant-design-vue";
import SvgIcon from "@/components/SvgIcon.vue";
import { OPTION_TYPE, IElement } from "mwhiteboard";

const emit = defineEmits(["endPreview"]);

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

const whiteboard = ref();
const screenRef = ref<HTMLDivElement>();
const previewSlideIndex = ref(props.startSlideIndex);
const previewSlide = computed(() => props.slides[previewSlideIndex.value]);
const hiddenTool = ref(false);
const whiteboardVisible = ref(false);

const slidesElements: IElement[][] = [];

setTimeout(() => {
    hiddenTool.value = true;
}, 5000);

const options = ref({
    offsetX: 0,
    offsetY: 0
});

let screen: Screen | undefined;
nextTick(() => {
    if (screenRef.value) {
        screen = new Screen(
            screenRef.value,
            previewSlide.value
        );

        screen.mouseSingleClick = next;

        screenRef.value.focus();
    }

    if (whiteboard.value) {
        whiteboard.value.setOptionType(OPTION_TYPE.PEN);
    }
});

const updateSlide = async (type: "prev" | "next") => {
    screen && await screen.updateSlide(previewSlide.value, type);
};

const saveWhiteboardElements = () => {
    const elements: IElement[] = whiteboard.value.getElements();
    slidesElements[previewSlideIndex.value] = elements;
};

const renderWhiteboardElements = () => {
    const elements = slidesElements[previewSlideIndex.value] || [];
    whiteboard.value.setElements(elements);
    whiteboard.value.render();
};

const prev = async () => {
    const animations = previewSlide.value.animations || [];
    const firstClickIndex = animations.findIndex(item => item.trigger === "click");
    if (screen && screen.stageConfig.animationIndex >= firstClickIndex) {
        screen.prevStep();
    } else if (previewSlideIndex.value > 0) {
        saveWhiteboardElements();
        previewSlideIndex.value--;
        await updateSlide("prev");
        renderWhiteboardElements();
        // screen && screen.resetLastAnimationIndex();
    } else {
        message.warning("已经是第一页了");
    }
};

const next = async () => {
    const animations = previewSlide.value.animations;
    if (animations && animations.length > 0 && screen && screen.stageConfig.animationIndex < animations.length - 1) {
        screen.nextStep();
    } else if (previewSlideIndex.value < props.slides.length - 1) {
        // 进行翻页后，重置动画索引到最后一步
        saveWhiteboardElements();
        previewSlideIndex.value++;
        await updateSlide("next");
        renderWhiteboardElements();
    } else {
        message.warning("已经是最后一页了");
    }
};

const onKeydown = (event: KeyboardEvent) => {
    event.preventDefault();
    switch (event.key) {
        case KeyMap.Left:
        case KeyMap.Up: {
            // 上一页
            prev();
            break;
        }
        case KeyMap.Right:
        case KeyMap.Down: {
            // 下一页
            next();
            break;
        }
    }

    setTimeout(() => {
        // 重新聚焦
        (event.target as HTMLDivElement).focus();
    }, 100);
};

const endPreview = () => {
    emit("endPreview");
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

.white-board-box {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    pointer-events: none;
}

.ppt-preview-tools {
    position: fixed;
    z-index: 10001;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #54585d;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: 0;
    min-height: 64px;
    border-radius: 10px;
    padding: 0 20px;
    transition: opacity 0.3s ease 0s;
}

.ppt-preview-size {
    font-size: 16px;
    color: #eee;
    margin: 0 10px;
}

.preview-tools-text {
    color: #eee;
    font-size: 12px;
    margin-top: 5px;
}

.preview-tools-btn {
    width: 64px;
    height: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
        background-color: #333;
    }
    &.active {
        background-color: #333;
    }
}

.hidden-preview-tools {
    opacity: 0;
    &:hover {
        opacity: 1;
    }
}
</style>

<style>
.white-board-box canvas {
    cursor: default !important;
}
.white-board-box.ppt-can-write {
    pointer-events: all;
}
.white-board-box.ppt-can-write canvas {
    cursor: url(@/assets/images/cursor.png) 7 7, default !important;
}
</style>
