<template>
    <a-tabs style="margin-top: -8px" v-model:activeKey="animationType">
        <a-tab-pane key="in" tab="进入">
            <div class="ppt-animation-content">
                <div
                    class="ppt-animation-pool-type"
                    :key="effect.name"
                    v-for="effect in ANIMATION_IN"
                >
                    <div class="ppt-animation-type-title">
                        {{ effect.name }}：
                    </div>
                    <div class="ppt-animation-pool-item-wrapper">
                        <div
                            class="ppt-animation-pool-item"
                            v-for="item in effect.children"
                            :key="item.name"
                            @mouseenter="hoverPreviewAnimation = item.value"
                            @mouseleave="hoverPreviewAnimation = ''"
                            @click="addAnimation(item)"
                        >
                            <div
                                class="ppt-animation-animation-box"
                                :class="[
                                    `animate__animated`,
                                    hoverPreviewAnimation === item.value &&
                                        `animate__${item.value}`
                                ]"
                            >
                                {{ item.name }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a-tab-pane>
        <a-tab-pane key="attention" tab="强调" force-render>
            <div class="ppt-animation-content">
                <div
                    class="ppt-animation-pool-type"
                    :key="effect.name"
                    v-for="effect in ANIMATION_ATTENTION"
                >
                    <div class="ppt-animation-type-title">
                        {{ effect.name }}：
                    </div>
                    <div class="ppt-animation-pool-item-wrapper">
                        <div
                            class="ppt-animation-pool-item"
                            v-for="item in effect.children"
                            :key="item.name"
                            @mouseenter="hoverPreviewAnimation = item.value"
                            @mouseleave="hoverPreviewAnimation = ''"
                            @click="addAnimation(item)"
                        >
                            <div
                                class="ppt-animation-animation-box"
                                :class="[
                                    `animate__animated`,
                                    hoverPreviewAnimation === item.value &&
                                        `animate__${item.value}`
                                ]"
                            >
                                {{ item.name }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a-tab-pane>
        <a-tab-pane key="out" tab="退出">
            <div class="ppt-animation-content">
                <div class="ppt-animation-content">
                    <div
                        class="ppt-animation-pool-type"
                        :key="effect.name"
                        v-for="effect in ANIMATION_OUT"
                    >
                        <div class="ppt-animation-type-title">
                            {{ effect.name }}：
                        </div>
                        <div class="ppt-animation-pool-item-wrapper">
                            <div
                                class="ppt-animation-pool-item"
                                v-for="item in effect.children"
                                :key="item.name"
                                @mouseenter="hoverPreviewAnimation = item.value"
                                @mouseleave="hoverPreviewAnimation = ''"
                                @click="addAnimation(item)"
                            >
                                <div
                                    class="ppt-animation-animation-box"
                                    :class="[
                                        `animate__animated`,
                                        hoverPreviewAnimation === item.value &&
                                            `animate__${item.value}`
                                    ]"
                                >
                                    {{ item.name }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a-tab-pane>
    </a-tabs>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
    ANIMATION_ATTENTION,
    ANIMATION_IN,
    ANIMATION_OUT
} from "@/plugins/config/animation";
import "animate.css";

const props = defineProps({
    type: {
        type: String,
        default: "in"
    }
});

const emit = defineEmits(["change"]);

const animationType = ref(props.type);
const hoverPreviewAnimation = ref("");

const addAnimation = (animation: { name: string; value: string; duration: number; }) => {
    emit("change", animationType.value, animation);
};
</script>

<style lang="scss" scoped>
.ppt-animation-content {
    width: 400px;
    height: 500px;
    overflow-y: auto;
    .ppt-animation-type-title {
        background-color: rgba(24, 144, 255, 0.15);
        width: 100%;
        font-size: 13px;
        margin-bottom: 10px;
        border-left: 4px solid #1890ff;
        padding: 2px 0 2px 10px;
    }

    .ppt-animation-pool-item-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
    }

    .ppt-animation-pool-item {
        width: 24%;
        margin-bottom: 1.33333%;
        margin-bottom: 10px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        cursor: pointer;
        font-size: 12px;
        &:not(:nth-child(4n)) {
            margin-right: 1.33333%;
        }
    }

    .ppt-animation-animation-box {
        background-color: #f9f9f9;
        color: #555;
    }
}
</style>
