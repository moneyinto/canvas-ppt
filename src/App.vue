<template>
    <div class="ppt-container">
        <div class="ppt-toolbar">
            <NavMenu />
            <Tools />
        </div>
        <div class="ppt-body">
            <div class="ppt-thumbnail" @keydown.stop="onKeydown" tabindex="0">
                <div
                    class="ppt-thumbnail-box"
                    v-for="(slide, index) in viewSlides"
                    :key="slide.id"
                    @click="onSelectedSlide(slide.id)"
                >
                    <ThumbnailSlide :size="150" :slide="slide" />

                    <div class="ppt-thumbnail-index">
                        {{ index + 1 }}
                    </div>
                    <div
                        class="ppt-thumbnail-selected"
                        v-if="slide.id === selectedSlideId"
                    ></div>
                </div>
            </div>
            <div class="ppt-content" ref="pptRef">
                <div
                    class="ppt-no-slide"
                    v-if="viewSlides.length === 0"
                    @click="addEmptyPPT()"
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
        </div>
        <div class="ppt-footer">
            <Footer @onZoomChange="resize" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { nextTick, onUnmounted, provide, ref } from "vue";
import NavMenu from "./layout/NavMenu/index.vue";
import Tools from "./layout/Tools/index.vue";
import ThumbnailSlide from "./layout/ThumbnailSlide.vue";
import Footer from "./layout/Footer.vue";
import Editor from "./plugins/editor";
import { ISlide } from "./plugins/types/slide";
import { slides } from "./mock";
import emitter, { EmitterEvents } from "./utils/emitter";
import { createRandomCode } from "./utils/create";
import { KeyMap } from "./plugins/shortCut/keyMap";

const pptRef = ref();
const zoom = ref(1);
const slideIndex = ref(0);
const selectedSlideId = ref("");
const instance = ref<Editor>();
const viewSlides = ref(slides);

const historyCursor = ref(0);
const historyLength = ref(0);

provide("instance", instance);
provide("historyCursor", historyCursor);
provide("historyLength", historyLength);

nextTick(() => {
    if (pptRef.value) {
        instance.value = new Editor(pptRef.value, slides);
        // 设置初始化页面
        if (slides.length > 0) {
            selectedSlideId.value = slides[slideIndex.value].id;
            instance.value.stageConfig.setSlideId(selectedSlideId.value);
            // 进行渲染
            instance.value.command.executeRender();
            // 初始化时增加历史记录
            instance.value.history.add();
        }

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
                if (updateSlide) emitter.emit(EmitterEvents.UPDATE_THUMBNAIL, updateSlide);
                onSelectedSlide(slideId);
            }
            const updateSlide = viewSlides.value.find(
                (slide) => slide.id === slideId
            );
            if (updateSlide) emitter.emit(EmitterEvents.UPDATE_THUMBNAIL, updateSlide);
        };

        emitter.on(EmitterEvents.ADD_EMPTY_SLIDE, addEmptyPPT);
    }
});

const resize = (scale: number) => {
    zoom.value = scale / 100;
};

const addEmptyPPT = (slide?: ISlide) => {
    slideIndex.value++;
    const id = createRandomCode();
    const newSlide = slide ? { ...slide, id } : { id, elements: [] };
    viewSlides.value.splice(slideIndex.value, 0, newSlide);
    onSelectedSlide(id);
    instance.value?.stageConfig.setSildes(viewSlides.value);
    instance.value?.history.add();
};

const onSelectedSlide = (id: string) => {
    slideIndex.value = viewSlides.value.findIndex((slide) => slide.id === id);
    selectedSlideId.value = id;
    instance.value?.stageConfig.setSlideId(selectedSlideId.value);
    instance.value?.stageConfig.setOperateElement(null);
    instance.value?.command.executeRender();
};

const onKeydown = (event: KeyboardEvent) => {
    if (event.key === KeyMap.Delete || event.key === KeyMap.Backspace) {
        // 执行页面删除
        if (viewSlides.value.length === 0) return;
        viewSlides.value.splice(slideIndex.value, 1);
        if (
            viewSlides.value.length === slideIndex.value &&
            viewSlides.value.length > 0
        ) {
            slideIndex.value--;
        }
        if (viewSlides.value.length === 0) {
            instance.value?.command.executeRender();
            return;
        }
        const slideId = viewSlides.value[slideIndex.value].id;
        if (slideId) onSelectedSlide(slideId);
    }
};

onUnmounted(() => {
    emitter.off(EmitterEvents.ADD_EMPTY_SLIDE, addEmptyPPT);
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
    .ppt-thumbnail {
        outline: 0;
        width: 200px;
        border-right: 1px solid #d1d1d1;
        background-color: #fafafa;
        padding: 15px 0;

        .ppt-thumbnail-index {
            position: absolute;
            top: 0;
            left: -20px;
            color: #555555;
        }

        .ppt-thumbnail-box {
            position: relative;
            margin: 0 15px 15px 35px;
            width: 150px;
        }

        .ppt-thumbnail-selected {
            position: absolute;
            border: 1px solid #5b9bd5;
            top: -2px;
            left: -2px;
            bottom: -2px;
            right: -2px;
            pointer-events: none;
        }
    }
    .ppt-content {
        flex: 1;
        min-width: 0;
        position: relative;
    }
}

.ppt-footer {
    height: 32px;
    background-color: #e9e9e9;
    border-top: 1px solid rgba(65, 70, 75, 0.1);
}
</style>
