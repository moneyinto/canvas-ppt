<template>
    <div class="ppt-container">
        <div class="ppt-toolbar">
            <NavMenu :elements="currentElements" :slideFocus="slideFocus" />
            <Tools :elements="currentElements" />
        </div>
        <div class="ppt-body">
            <div
                class="ppt-thumbnail"
                @keydown.stop="onKeydown"
                tabindex="0"
                @drop="onDrop"
                @dragend="onDragEnd"
                @dragover="onDragOver"
                @focus="onSlideFocus"
            >
                <div
                    class="ppt-thumbnail-box"
                    v-for="(slide, index) in viewSlides"
                    :key="slide.id"
                    @click="onSelectedSlide(slide.id)"
                    @dragstart="onDragStart(index)"
                >
                    <ThumbnailSlide
                        draggable="true"
                        :size="150"
                        :slide="slide"
                    />

                    <div
                        class="ppt-sort-top"
                        :class="
                            sortIndex === index &&
                            sortType === 'top' &&
                            'ppt-sort-line'
                        "
                        v-if="sortIndex !== -1"
                        @dragenter="onDragEnter(index, 'top')"
                    ></div>
                    <div
                        class="ppt-sort-bottom"
                        :class="
                            sortIndex === index &&
                            sortType === 'bottom' &&
                            'ppt-sort-line'
                        "
                        v-if="sortIndex !== -1"
                        @dragenter="onDragEnter(index, 'bottom')"
                    ></div>

                    <div class="ppt-thumbnail-index">
                        {{ index + 1 }}
                    </div>
                    <div
                        class="ppt-thumbnail-selected"
                        v-if="slide.id === selectedSlideId"
                    ></div>
                </div>
            </div>
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
                :total="slides.length"
                :current="slideIndex"
                @onZoomChange="resize"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { nextTick, onUnmounted, provide, ref } from "vue";
import NavMenu from "./layout/NavMenu/index.vue";
import Tools from "./layout/Tools/index.vue";
import ThumbnailSlide from "./layout/ThumbnailSlide.vue";
import Footer from "./layout/Footer.vue";
import Panels from "./layout/Panels/index.vue";
import Editor from "./plugins/editor";
import { slides } from "./mock";
import emitter, { EmitterEvents } from "./utils/emitter";
import { KeyMap } from "./plugins/shortCut/keyMap";
import { checkIsMac } from "./utils";
import useSlideHandler from "@/hooks/useSlideHandler";
import useSlideSort from "@/hooks/useSlideSort";
import { ISlide } from "./plugins/types/slide";
import { IPPTElement } from "./plugins/types/element";

const pptRef = ref<HTMLDivElement>();
const zoom = ref(1);
const instance = ref<Editor>();
const viewSlides = ref<ISlide[]>([]);

const historyCursor = ref(0);
const historyLength = ref(0);

const showPanel = ref(false);

provide("instance", instance);
provide("historyCursor", historyCursor);
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

const {
    sortIndex,
    sortType,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragEnd,
    onDrop
} = useSlideSort(instance, viewSlides);

const slideFocus = ref(false);
const onSlideFocus = () => {
    slideFocus.value = true;
};

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

        emitter.on(EmitterEvents.ADD_EMPTY_SLIDE, addPPT);
        emitter.on(EmitterEvents.COPY_SLIDE, copySlide);
        emitter.on(EmitterEvents.CUT_SLIDE, cutSlide);
        emitter.on(EmitterEvents.PASTE_SLIDE, pasteSlide);
    }

    emitter.on(EmitterEvents.SHOW_PANELS, openPanel);
});

const resize = (scale: number) => {
    zoom.value = scale / 100;
};

const onKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
        case KeyMap.Delete:
        case KeyMap.Backspace: {
            deleteSlide();
            break;
        }
        case KeyMap.Up: {
            // 上一页
            if (slideIndex.value > 0) {
                slideIndex.value--;
                switchSlide();
            }
            break;
        }
        case KeyMap.Down: {
            // 下一页
            if (slideIndex.value < viewSlides.value.length - 1) {
                slideIndex.value++;
                switchSlide();
            }
            break;
        }
        case KeyMap.X_UPPERCASE:
        case KeyMap.X: {
            if (checkIsMac()) {
                if (event.metaKey) {
                    // 剪切
                    cutSlide();
                }
            } else {
                if (event.ctrlKey) {
                    cutSlide();
                }
            }
            break;
        }
        case KeyMap.C_UPPERCASE:
        case KeyMap.C: {
            if (checkIsMac()) {
                if (event.metaKey) {
                    // 复制
                    copySlide();
                }
            } else {
                if (event.ctrlKey) {
                    copySlide();
                }
            }
            break;
        }

        case KeyMap.V_UPPERCASE:
        case KeyMap.V: {
            if (checkIsMac()) {
                if (event.metaKey) {
                    // 复制
                    pasteSlide();
                }
            } else {
                if (event.ctrlKey) {
                    pasteSlide();
                }
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
    emitter.off(EmitterEvents.ADD_EMPTY_SLIDE, addPPT);
    emitter.off(EmitterEvents.COPY_SLIDE, copySlide);
    emitter.off(EmitterEvents.CUT_SLIDE, cutSlide);
    emitter.off(EmitterEvents.PASTE_SLIDE, pasteSlide);
    emitter.off(EmitterEvents.SHOW_PANELS, openPanel);
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

            .ppt-sort-top,
            .ppt-sort-bottom {
                position: absolute;
                height: 30px;
                bottom: 0;
                left: 0;
                right: 0;
            }

            .ppt-sort-top {
                top: 0;
                bottom: inherit;
            }

            .ppt-sort-line:after {
                content: "";
                position: absolute;
                height: 2px;
                left: 0;
                right: 0;
                background-color: #5b9bd5;
            }

            .ppt-sort-top.ppt-sort-line:after {
                top: -8px;
            }

            .ppt-sort-bottom.ppt-sort-line:after {
                bottom: -8px;
            }
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
