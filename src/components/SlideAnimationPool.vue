<template>
    <div class="ppt-animation-content">
        <div class="ppt-animation-type-title">无：</div>
        <div class="ppt-animation-pool-item-wrapper">
            <div
                class="ppt-animation-pool-item"
                @click="addAnimation()"
            >
                <div class="ppt-animation-animation-box">无</div>
            </div>
        </div>
        <div
            class="ppt-animation-pool-type"
            :key="effect.name"
            v-for="effect in ANIMATION_IN"
        >
            <div class="ppt-animation-type-title">{{ effect.name }}：</div>
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ANIMATION_IN } from "@/config/animation";
import "animate.css";

const emit = defineEmits(["change"]);

const hoverPreviewAnimation = ref("");

const addAnimation = (animation?: {
    name: string;
    value: string;
    duration: number;
}) => {
    emit("change", animation);
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
