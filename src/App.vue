<template>
    <div class="ppt-container">
        <div class="ppt-toolbar">
            <NavMenu />
            <Tools />
        </div>
        <div class="ppt-body">
            <div class="ppt-thumbnail">
                <div
                    class="ppt-thumbnail-box"
                    v-for="(slide, index) in viewSlides"
                    :key="slide.id"
                    @click="onSelectedSlide(slide.id)"
                >
                    <ThumbnailSlide
                        :size="150"
                        :slide="slide"
                    />

                    <div class="ppt-thumbnail-index">
                        {{ index + 1 }}
                    </div>
                    <div class="ppt-thumbnail-selected" v-if="slide.id === selectedSlideId"></div>
                </div>
            </div>
            <div class="ppt-content" ref="pptRef"></div>
        </div>
        <div class="ppt-footer">
            <Footer :zoom="zoom" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { nextTick, provide, ref } from "vue";
import NavMenu from "./layout/NavMenu/index.vue";
import Tools from "./layout/Tools/index.vue";
import ThumbnailSlide from "./layout/ThumbnailSlide.vue";
import Footer from "./layout/Footer.vue";
import Editor from "./plugins/editor";
import { slides } from "./mock";
import emitter, { EmitterEvents } from "./utils/emitter";

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
        }

        // 编辑监听
        instance.value.listener.onEditChange = (cursor, length) => {
            historyCursor.value = cursor;
            historyLength.value = length;

            emitter.emit(EmitterEvents.UPDATE_THUMBNAIL, selectedSlideId.value);
        };
    }
});

const onSelectedSlide = (id: string) => {
    slideIndex.value = viewSlides.value.findIndex((slide) => slide.id === id);
    selectedSlideId.value = id;
    instance.value?.stageConfig.setSlideId(selectedSlideId.value);
    instance.value?.stageConfig.setOperateElement(null);
    instance.value?.command.executeRender();
};
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

.ppt-toolbar {
    height: 62px;
    background-color: #f7f7f7;
}

.ppt-body {
    flex: 1;
    min-height: 0;
    display: flex;
    .ppt-thumbnail {
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
