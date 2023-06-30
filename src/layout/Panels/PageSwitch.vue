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
            xx
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject, Ref } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";
import Editor from "@/plugins/editor";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

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
        position: relative;
        padding-top: 10px;
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
            position: relative;
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

        .drag-line {
            position: absolute;
            left: 0;
            right: 0;
            border-top: 2px solid #1890ff;
        }

        .ppt-animation-item-footer {
            position: relative;
            height: 20px;
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
