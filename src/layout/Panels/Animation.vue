<template>
    <div class="ppt-background-panel" @click="outsideClick">
        <div class="ppt-panel-header">
            <div class="ppt-panel-title">
                <SvgIcon name="background" :size="32" />
                元素动画
            </div>
            <SvgIcon
                class="ppt-close-btn"
                @click="closePanel()"
                name="close"
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
                            <SvgIcon name="play" :size="8" />
                        </div>
                    </a-tooltip>
                    <a-divider class="ppt-tool-divider" type="vertical" />
                    <a-tooltip placement="topRight" title="删除全部">
                        <div class="ppt-animation-btn">
                            <SvgIcon name="delete" :size="14" />
                        </div>
                    </a-tooltip>
                </div>
            </div>

            <div class="ppt-animation-list">
                <div
                    class="ppt-animation-item"
                    v-for="(ani, index) in animations"
                    :class="{
                        active: elements.some((el) => el.id === ani.elId),
                        selected: selectedAnimation?.id === ani.id
                    }"
                    :key="ani.id"
                    @click.stop="selectAnimation(ani)"
                >
                    <div class="ppt-animation-index">{{ index + 1 }}</div>
                    <div class="ppt-element-type">
                        {{ getElement(ani.elId)?.name }}
                    </div>
                    <div class="ppt-animation-name">{{ ani.name }}</div>
                    <div class="ppt-animation-btns">
                        <div
                            class="ppt-animation-btn"
                            @click.stop="preview(ani)"
                        >
                            <SvgIcon name="play" :size="8" />
                        </div>
                        <a-divider class="ppt-tool-divider" type="vertical" />
                        <div
                            class="ppt-animation-btn"
                            @click.stop="deleteAnimation(ani)"
                        >
                            <SvgIcon name="delete" :size="14" />
                        </div>
                    </div>
                </div>

                <div class="ppt-add-animation">
                    <a-popover
                        v-model:visible="showAnimationPanel"
                        trigger="click"
                        placement="topRight"
                        arrow-point-at-center
                    >
                        <template #content>
                            <AnimationPool @change="addAnimation" />
                        </template>
                        <a-button
                            type="link"
                            :disabled="addBtnDisabled"
                            @click.stop="showAnimationPanel = true"
                        >
                            <div
                                class="ppt-add-button"
                                :class="!addBtnDisabled && 'active'"
                            >
                                <SvgIcon
                                    name="addCircle"
                                    :color="
                                        addBtnDisabled ? '#8B8E91' : '#1890ff'
                                    "
                                    :size="18"
                                />
                                <div class="ppt-add-animation-text">
                                    添加动画
                                </div>
                            </div>
                        </a-button>
                    </a-popover>
                </div>
            </div>

            <div class="ppt-animation-set" v-if="selectedAnimation" @click.stop>
                <div class="ppt-animation-set-title">动画设置</div>

                <div class="ppt-animation-set-line">
                    <div class="ppt-animation-set-label">动画</div>
                    <div class="ppt-animation-set-value">
                        <a-popover
                            v-model:visible="showSetAnimationPanel"
                            trigger="click"
                            placement="topRight"
                            arrow-point-at-center
                        >
                            <template #content>
                                <AnimationPool @change="editAnimation" />
                            </template>
                            <a-input
                                readonly="readonly"
                                v-model:value="selectedAnimation.name"
                            />
                        </a-popover>
                    </div>
                </div>

                <div class="ppt-animation-set-line">
                    <div class="ppt-animation-set-label">时机</div>
                    <div class="ppt-animation-set-value">
                        <a-select
                            v-model:value="selectedAnimation.trigger"
                            @change="animationChange"
                        >
                            <a-select-option value="click">
                                单击鼠标时
                            </a-select-option>
                            <a-select-option value="meantime">
                                与上个动画同时
                            </a-select-option>
                            <a-select-option value="after">
                                在上个动画之后
                            </a-select-option>
                        </a-select>
                    </div>
                </div>

                <div class="ppt-animation-set-line">
                    <div class="ppt-animation-set-label">速度</div>
                    <div class="ppt-animation-set-value">
                        <a-input-number
                            v-model:value="selectedAnimation.duration"
                            min="0"
                            @input="animationChange"
                        />
                    </div>
                </div>
            </div>

            <div class="ppt-animation-tip" v-if="addBtnDisabled">
                选中元素后可添加和设置元素动画
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject, PropType, ref, Ref, watch } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";
import Editor from "@/plugins/editor";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { IPPTAnimation } from "@/types/slide";
import { IPPTElement } from "@/types/element";
import AnimationPool from "@/components/AnimationPool.vue";
import { createRandomCode } from "@/utils/create";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const instance = inject<Ref<Editor>>("instance");

const animations = ref<IPPTAnimation[]>([]);
const addBtnDisabled = ref(true);
const selectedAnimation = ref<IPPTAnimation | null>(null);

const init = async () => {
    if (instance?.value) {
        animations.value = instance.value.stageConfig.getAnimations();

        instance.value.listener.onAnimationsChange = () => {
            animations.value = instance.value.stageConfig.getAnimations();
        };

        addBtnDisabled.value = props.elements.length === 0;
    }
};

init();

watch(instance!, init);

watch(
    () => props.elements,
    () => {
        addBtnDisabled.value = props.elements.length === 0;
    }
);

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

const selectAnimation = (ani: IPPTAnimation) => {
    selectedAnimation.value = ani;
};

const showAnimationPanel = ref(false);
const addAnimation = (
    type: string,
    animation: { name: string; value: string; duration: number }
) => {
    showAnimationPanel.value = false;
    const newAnimations: IPPTAnimation[] = props.elements.map((el) => {
        return {
            id: createRandomCode(),
            elId: el.id,
            ani: animation.value,
            name: animation.name,
            type,
            duration: animation.duration,
            trigger: "click"
        } as IPPTAnimation;
    });
    instance?.value?.command.executeAddAnimation(newAnimations);
};

const showSetAnimationPanel = ref(false);
const editAnimation = (type: "in" | "out" | "attention", animation: { name: string; value: string; duration: number }) => {
    showSetAnimationPanel.value = false;
    if (!selectedAnimation.value) return;
    selectedAnimation.value.name = animation.name;
    selectedAnimation.value.ani = animation.value;
    selectedAnimation.value.duration = animation.duration;
    selectedAnimation.value.type = type;
    animationChange();
};

const animationChange = () => {
    if (!selectedAnimation.value) return;
    const index = animations.value.findIndex(
        (ani) => ani.id === selectedAnimation.value?.id
    );
    animations.value.splice(index, 1, selectedAnimation.value);
    instance?.value?.command.executeEditAnimation(animations.value);
};

const outsideClick = () => {
    showAnimationPanel.value = false;
    selectedAnimation.value = null;
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
            margin-bottom: 8px;
            .ppt-animation-btns {
                display: none;
            }

            &.active {
                background-color: rgb(231, 243, 253);
            }

            &.selected {
                border: 1px solid rgb(91, 157, 244);
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
            position: sticky;
            bottom: 0;
            background-color: rgb(250, 250, 250);
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

    .ppt-animation-tip {
        text-align: center;
        margin: 10px 0px 26px;
        color: rgba(65, 70, 75, 0.9);
        opacity: 0.5;
        font-size: 12px;
    }
}

.ppt-animation-set {
    border-top: 1px solid #eee;
    padding: 0 3px 15px;
    .ppt-animation-set-title {
        font-size: 12px;
        font-weight: 600;
        padding: 10px 0;
    }

    .ppt-animation-set-line {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .ppt-animation-set-label {
            font-size: 12px;
            margin-right: 20px;
        }
        .ppt-animation-set-value {
            flex: 1;
            :deep(.ant-input) {
                cursor: pointer;
                font-size: 12px;
                padding: 6px 11px;
            }

            :deep(.ant-select) {
                width: 100%;
            }

            :deep(.ant-input-number) {
                width: 100%;
            }
        }
    }
}
</style>
