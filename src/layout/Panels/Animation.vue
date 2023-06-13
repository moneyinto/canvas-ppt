<template>
    <div class="ppt-background-panel">
        <div class="ppt-panel-header">
            <div class="ppt-panel-title">
                <PPTIcon icon="background" :size="32" />
                元素动画
            </div>
            <PPTIcon
                class="ppt-close-btn"
                @click="closePanel()"
                icon="close"
                :size="18"
            />
        </div>
        <div class="ppt-panel-content">
            <div class="ppt-animation-title">
                <div class="ppt-animation-count">
                    共
                    <span>{{ animations.length }}</span>
                    个动画
                </div>

                <div class="ppt-animation-btns">
                    <a-tooltip title="预览全部">
                        <div class="ppt-animation-btn">
                            <PPTIcon icon="play" :size="8" />
                        </div>
                    </a-tooltip>
                    <a-divider class="ppt-tool-divider" type="vertical" />
                    <a-tooltip title="删除全部">
                        <div class="ppt-animation-btn">
                            <PPTIcon icon="delete" :size="14" />
                        </div>
                    </a-tooltip>
                </div>
            </div>

            <div class="ppt-animation-list">
                <div
                    class="ppt-animation-item"
                    v-for="(ani, index) in animations"
                    :key="ani.id"
                >
                    <div class="ppt-animation-index">{{ index + 1 }}</div>
                    <div class="ppt-element-type">
                        {{ getElement(ani.elId)?.name }}
                    </div>
                    <div class="ppt-animation-name">{{ ani.name }}</div>
                    <div class="ppt-animation-btns">
                        <div class="ppt-animation-btn" @click="preview(ani)">
                            <PPTIcon icon="play" :size="8" />
                        </div>
                        <a-divider class="ppt-tool-divider" type="vertical" />
                        <div
                            class="ppt-animation-btn"
                            @click="deleteAnimation(ani)"
                        >
                            <PPTIcon icon="delete" :size="14" />
                        </div>
                    </div>
                </div>

                <div class="ppt-add-animation">
                    <a-button type="link" :disabled="addBtnDisabled">
                        <div class="ppt-add-button" :class="!addBtnDisabled && 'active'">
                            <PPTIcon icon="addCircle" :size="18" />
                            <div class="ppt-add-animation-text">添加动画</div>
                        </div>
                    </a-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject, PropType, ref, Ref, watch } from "vue";
import PPTIcon from "@/components/Icon.vue";
import Editor from "@/plugins/editor";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { IPPTAnimation } from "@/types/slide";
import { IPPTElement } from "@/types/element";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const instance = inject<Ref<Editor>>("instance");

const animations = ref<IPPTAnimation[]>([]);
const addBtnDisabled = ref(true);

const init = async () => {
    if (instance?.value) {
        animations.value = instance.value.stageConfig.getAnimations();

        instance.value.listener.onAnimationsChange = () => {
            animations.value = instance.value.stageConfig.getAnimations();
        };
    }
};

init();

watch(instance!, init);

watch(() => props.elements, () => {
    addBtnDisabled.value = props.elements.length === 0;
});

const closePanel = () => {
    emitter.emit(EmitterEvents.SHOW_PANELS, false);
    setTimeout(() => {
        emitter.emit(EmitterEvents.PANELS_TYPE, "");
    }, 300);
};

const getElement = (id: string) => {
    return instance?.value?.stageConfig.getElementById(id);
};

const preview = (ani?: IPPTAnimation) => {
    instance?.value?.command.executePreviewAnimation(ani);
};

const deleteAnimation = (ani?: IPPTAnimation) => {
    instance?.value?.command.executeDeleteAnimation(ani);
};
</script>

<style lang="scss" scoped>
.ppt-background-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    .ppt-panel-header {
        height: 44px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        justify-content: space-between;
        border-bottom: 1px solid rgba(65, 70, 75, 0.1);
    }

    .ppt-panel-title {
        display: flex;
        align-items: center;
    }

    .ppt-close-btn {
        cursor: pointer;
    }

    .ppt-panel-content {
        padding: 10px 15px;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .ppt-animation-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 20px;
        font-size: 12px;
        margin-bottom: 15px;
        span {
            margin: 0 3px;
        }
    }

    .ppt-animation-btns {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .ppt-tool-divider {
            top: 0;
            margin: 0 15px;
            border-left: 1px solid rgba(0, 0, 0, 0.2);
        }
        .ppt-animation-btn {
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .ppt-animation-list {
        flex: 1;
        overflow-y: auto;
        min-height: 0;

        .ppt-animation-item {
            cursor: grab;
            user-select: none;
            background: rgb(255, 255, 255);
            border: 1px solid rgb(236, 237, 237);
            border-radius: 4px;
            height: 40px;
            padding: 10px 12px 10px 8px;
            margin-bottom: 8px 0;
            font-size: 12px;
            display: flex;
            align-items: center;
            .ppt-animation-btns {
                display: none;
            }

            &:hover {
                .ppt-animation-btns {
                    display: flex;
                    margin-left: 20px;
                }

                .ppt-animation-name {
                    display: none;
                }
            }
        }

        .ppt-animation-index {
            margin-right: 10px;
        }

        .ppt-element-type {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .ppt-animation-name {
            color: rgba(65, 70, 75, 0.6);
            margin-left: 20px;
        }

        .ppt-add-animation {
            display: flex;
            justify-content: center;
            padding: 20px 0;

            .ppt-add-button {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: rgba(65, 70, 75, 0.6);
                &.active {
                    color: #1890ff;
                }
            }
        }
    }
}
</style>
