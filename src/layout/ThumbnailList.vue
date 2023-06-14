<template>
    <div
        class="ppt-thumbnail"
        @keydown.stop="onKeydown"
        tabindex="0"
        @drop="onDrop"
        @dragend="onDragEnd"
        @dragover="onDragOver"
        @focus="onSlideFocus"
    >
        <div class="ppt-thumbnail-body">
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
                    :index="index"
                />

                <div
                    class="ppt-sort-top"
                    :class="
                        sortIndex === index && sortType === 'top' && 'ppt-sort-line'
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
    </div>
</template>

<script lang="ts" setup>
import useSlideSort from "@/hooks/useSlideSort";
import Editor from "@/plugins/editor";
import { KeyMap } from "@/plugins/shortCut/keyMap";
import { ISlide } from "@/types/slide";
import { checkIsMac } from "@/utils";
import { Ref, inject } from "vue";
import ThumbnailSlide from "./ThumbnailSlide.vue";

const instance = inject<Ref<Editor>>("instance");
const slideIndex = inject<Ref<number>>("slideIndex");
const selectedSlideId = inject<Ref<string>>("selectedSlideId");
const slideFocus = inject<Ref<boolean>>("slideFocus");
const viewSlides = inject<Ref<ISlide[]>>("viewSlides");

const props = defineProps({
    deleteSlide: {
        type: Function,
        required: true
    },
    switchSlide: {
        type: Function,
        required: true
    },
    cutSlide: {
        type: Function,
        required: true
    },
    copySlide: {
        type: Function,
        required: true
    },
    pasteSlide: {
        type: Function,
        required: true
    },
    onSelectedSlide: {
        type: Function,
        required: true
    }
});

const {
    sortIndex,
    sortType,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragEnd,
    onDrop
} = useSlideSort(instance!, viewSlides!);

const onSlideFocus = () => {
    slideFocus!.value = true;
};

const onKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
        case KeyMap.Delete:
        case KeyMap.Backspace: {
            props.deleteSlide();
            break;
        }
        case KeyMap.Up: {
            // 上一页
            if (slideIndex!.value > 0) {
                slideIndex!.value--;
                props.switchSlide();
            }
            break;
        }
        case KeyMap.Down: {
            // 下一页
            if (slideIndex!.value < viewSlides!.value.length - 1) {
                slideIndex!.value++;
                props.switchSlide();
            }
            break;
        }
        case KeyMap.X_UPPERCASE:
        case KeyMap.X: {
            if (checkIsMac()) {
                if (event.metaKey) {
                    // 剪切
                    props.cutSlide();
                }
            } else {
                if (event.ctrlKey) {
                    props.cutSlide();
                }
            }
            break;
        }
        case KeyMap.C_UPPERCASE:
        case KeyMap.C: {
            if (checkIsMac()) {
                if (event.metaKey) {
                    // 复制
                    props.copySlide();
                }
            } else {
                if (event.ctrlKey) {
                    props.copySlide();
                }
            }
            break;
        }

        case KeyMap.V_UPPERCASE:
        case KeyMap.V: {
            if (checkIsMac()) {
                if (event.metaKey) {
                    // 复制
                    props.pasteSlide();
                }
            } else {
                if (event.ctrlKey) {
                    props.pasteSlide();
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
</script>

<style lang="scss" scoped>
.ppt-thumbnail {
    outline: 0;
    width: 201px;
    border-right: 1px solid #d1d1d1;
    background-color: #fafafa;
    padding: 8px 0;
    .ppt-thumbnail-body {
        height: 100%;
        overflow-y: auto;
        padding: 8px 0;
    }

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
</style>
