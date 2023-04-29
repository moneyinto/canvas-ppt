<template>
    <div class="ppt-container">
        <div class="ppt-toolbar">
            <NavMenu
                :elements="currentElements"
                :slideFocus="slideFocus"
                :current="slideIndex"
                @onPreview="startPreview"
            />
            <Tools :elements="currentElements" />
        </div>
        <div class="ppt-body">
            <ThumbnailList
                :switchSlide="switchSlide"
                :deleteSlide="deleteSlide"
                :cutSlide="cutSlide"
                :copySlide="copySlide"
                :pasteSlide="pasteSlide"
                :onSelectedSlide="onSelectedSlide"
            />
            <div class="ppt-content" ref="pptRef" @focus="onCanvasFocus">
                <div
                    class="ppt-no-slide"
                    v-if="viewSlides.length === 0"
                    @click="addPPT()"
                >
                    <div
                        class="ppt-add-slide"
                        :style="{
                            transform: `scale(${zoom}) translate(-50%, -50%)`
                        }"
                    >
                        点击此处添加第一张幻灯片
                    </div>
                </div>
            </div>
            <div class="ppt-panel-box" :class="showPanel && 'active'">
                <Panels :visible="showPanel" />
            </div>
        </div>
        <div class="ppt-footer">
            <Footer
                :total="total"
                :current="slideIndex"
                @onZoomChange="resize"
                @onPreview="startPreview"
            />
        </div>

        <ScreenView
            v-if="showPreview"
            :slides="viewSlides"
            :startSlideIndex="startSlideIndex"
        />
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onUnmounted, provide, ref } from "vue";
import NavMenu from "./layout/NavMenu/index.vue";
import Tools from "./layout/Tools/index.vue";
import ThumbnailList from "./layout/ThumbnailList.vue";
import Footer from "./layout/Footer.vue";
import Panels from "./layout/Panels/index.vue";
import ScreenView from "./layout/ScreenView.vue";
import Editor from "./plugins/editor";
import { slides } from "./mock";
import emitter, { EmitterEvents } from "./utils/emitter";
import { enterFullScreen, isFullScreen } from "./utils";
import useSlideHandler from "@/hooks/useSlideHandler";
import { ISlide } from "./types/slide";
import { IPPTElement } from "./types/element";
import { message } from "ant-design-vue";

const pptRef = ref<HTMLDivElement>();
const zoom = ref(1);
const instance = ref<Editor>();
const viewSlides = ref<ISlide[]>([]);
const total = computed(() => viewSlides.value.length);

const historyCursor = ref(0);
const historyLength = ref(0);

const showPanel = ref(false);
const showPreview = ref(false);

provide("instance", instance);
provide("historyCursor", historyCursor);
provide("historyLength", historyLength);
provide("historyLength", historyLength);

const {
    slideIndex,
    selectedSlideId,
    initSlide,
    addPPT,
    onSelectedSlide,
    switchSlide,
    cutSlide,
    copySlide,
    pasteSlide,
    deleteSlide
} = useSlideHandler(instance, viewSlides, historyCursor, historyLength);

const slideFocus = ref(false);

provide("selectedSlideId", selectedSlideId);
provide("slideIndex", slideIndex);
provide("slideFocus", slideFocus);
provide("viewSlides", viewSlides);

const onCanvasFocus = () => {
    slideFocus.value = false;
};

const currentElements = ref<IPPTElement[]>([]);

const openPanel = (show: boolean) => {
    showPanel.value = show;
};

nextTick(() => {
    if (pptRef.value) {
        instance.value = new Editor(pptRef.value, slides);
        // 设置初始化页面
        initSlide();

        // 编辑监听
        instance.value.listener.onEditChange = (cursor, length, slideId) => {
            historyCursor.value = cursor;
            historyLength.value = length;
            viewSlides.value = instance.value!.stageConfig.slides;
            if (slideId !== selectedSlideId.value) {
                // id不相等切换页
                const updateSlide = viewSlides.value.find(
                    (slide) => slide.id === selectedSlideId.value
                );
                if (updateSlide) {
                    emitter.emit(EmitterEvents.UPDATE_THUMBNAIL, updateSlide);
                }
                onSelectedSlide(slideId);
            }
            const updateSlide = viewSlides.value.find(
                (slide) => slide.id === slideId
            );
            if (updateSlide) {
                emitter.emit(EmitterEvents.UPDATE_THUMBNAIL, updateSlide);
            }
        };

        instance.value.listener.onUpdateThumbnailSlide = (slide) => {
            emitter.emit(EmitterEvents.UPDATE_THUMBNAIL, slide);
        };

        instance.value.listener.onSelectedChange = (
            elements: IPPTElement[]
        ) => {
            currentElements.value = elements;
        };

        emitter.on(EmitterEvents.INIT_SLIDE, initSlide);
        emitter.on(EmitterEvents.ADD_EMPTY_SLIDE, addPPT);
        emitter.on(EmitterEvents.COPY_SLIDE, copySlide);
        emitter.on(EmitterEvents.CUT_SLIDE, cutSlide);
        emitter.on(EmitterEvents.DELETE_SLIDE, deleteSlide);
        emitter.on(EmitterEvents.PASTE_SLIDE, pasteSlide);
    }

    emitter.on(EmitterEvents.SHOW_PANELS, openPanel);
});

const resize = (scale: number) => {
    zoom.value = scale / 100;
};

const startSlideIndex = ref(0);
const startPreview = (slideIndex: number) => {
    if (viewSlides.value.length === 0) {
        message.warning("请添加幻灯片");
    } else {
        startSlideIndex.value = slideIndex;
        showPreview.value = true;
        enterFullScreen();
    }
};

const exitFullScreen = () => {
    if (!isFullScreen()) {
        showPreview.value = false;
    }
};

window.addEventListener("resize", exitFullScreen);

onUnmounted(() => {
    emitter.off(EmitterEvents.INIT_SLIDE, initSlide);
    emitter.off(EmitterEvents.ADD_EMPTY_SLIDE, addPPT);
    emitter.off(EmitterEvents.COPY_SLIDE, copySlide);
    emitter.off(EmitterEvents.CUT_SLIDE, cutSlide);
    emitter.off(EmitterEvents.DELETE_SLIDE, deleteSlide);
    emitter.off(EmitterEvents.PASTE_SLIDE, pasteSlide);
    emitter.off(EmitterEvents.SHOW_PANELS, openPanel);

    window.removeEventListener("resize", exitFullScreen);
});
</script>

<style lang="scss" scoped>
.ppt-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: #eee;
    z-index: 1;
}

.ppt-no-slide {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
    background-color: #eee;
    .ppt-add-slide {
        border: 1px dashed #555555;
        width: 1000px;
        height: 562.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 50px;
        position: absolute;
        top: 50%;
        left: 50%;
        cursor: pointer;
        transform-origin: top left;
    }
}

.ppt-toolbar {
    height: 62px;
    background-color: #f7f7f7;
}

.ppt-body {
    flex: 1;
    min-height: 0;
    display: flex;
    .ppt-content {
        flex: 1;
        min-width: 0;
        position: relative;
    }

    .ppt-panel-box {
        width: 0;
        transition: all .3s;
        position: relative;
        &.active {
            width: 280px;
        }
    }
}

.ppt-footer {
    height: 32px;
    background-color: #e9e9e9;
    border-top: 1px solid rgba(65, 70, 75, 0.1);
}
</style>
