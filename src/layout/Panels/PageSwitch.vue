<template>
    <div class="ppt-page-panel">
        <div class="ppt-panel-header">
            <div class="ppt-panel-title">
                <SvgIcon name="pageSwitch" :size="32" />
                切页动画
            </div>
            <SvgIcon
                class="ppt-close-btn"
                @click="closePanel()"
                name="close"
                :size="18"
            />
        </div>
        <div class="ppt-panel-content">
            <div class="ppt-animation-set" @click.stop>
                <div class="ppt-animation-set-title">动画设置</div>

                <div class="ppt-animation-set-line">
                    <div class="ppt-animation-set-label">动画</div>
                    <div class="ppt-animation-set-value">
                        <a-popover
                            v-model:visible="showAnimationPanel"
                            trigger="click"
                            placement="topRight"
                            arrow-point-at-center
                        >
                            <template #content>
                                <SlideAnimationPool @change="editAnimation" />
                            </template>
                            <a-input
                                readonly="readonly"
                                v-model:value="turningAni.name"
                            />
                        </a-popover>
                    </div>
                </div>

                <div class="ppt-animation-set-line">
                    <div class="ppt-animation-set-label">速度</div>
                    <div class="ppt-animation-set-value">
                        <a-input-number
                            v-model:value="turningAni.duration"
                            min="0"
                            @input="animationChange()"
                            @change="animationChange()"
                            :disabled="!turningAni.ani"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject, ref, Ref } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";
import Editor from "@/plugins/editor";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { IPPTTurningAnimation } from "@/types/slide";
import SlideAnimationPool from "@/components/SlideAnimationPool.vue";

const instance = inject<Ref<Editor>>("instance");

const showAnimationPanel = ref(false);
const noTurningAni = {
    name: "无",
    ani: "",
    duration: 0
};

const currentSlide = instance?.value?.stageConfig.getCurrentSlide();
const turningAni = ref<IPPTTurningAnimation>(currentSlide?.turningAni || noTurningAni);

const animationChange = () => {
    instance?.value?.command.executeEditPageAnimation(turningAni.value.ani ? turningAni.value : undefined);
};

const editAnimation = (
    animation?: { name: string; value: string; duration: number }
) => {
    if (animation) {
        turningAni.value = {
            name: animation.name,
            ani: animation.value,
            duration: animation.duration
        };
    } else {
        turningAni.value = noTurningAni;
    }
    showAnimationPanel.value = false;
    animationChange();
};

const closePanel = () => {
    emitter.emit(EmitterEvents.SHOW_PANELS, false);
    setTimeout(() => {
        emitter.emit(EmitterEvents.PANELS_TYPE, "");
    }, 300);
};
</script>

<style lang="scss" scoped>
.ppt-page-panel {
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
