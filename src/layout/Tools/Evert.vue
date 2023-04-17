<template>
    <div class="ppt-edit-tools">
        <a-tooltip :title="title" :visible="!showEvert && hoverEvert">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverEvert = true"
                @mouseleave="hoverEvert = false"
            >
                <div class="ppt-tool-block" @click="setFlip(flip)">
                    <PPTIcon :icon="flip" :size="26" />
                </div>

                <a-popover trigger="click" v-model:visible="showEvert">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showEvert = !showEvert"
                    >
                        <PPTIcon icon="down" :size="6" />
                    </div>

                    <template #content>
                        <div class="ppt-evert-content" @keydown.stop="" tabindex="0">
                            <div class="ppt-flip-item" @click="setFlip('flipH')">
                                <PPTIcon icon="flipH" :size="28" />
                                <div class="ppt-flip-text">水平翻转</div>
                            </div>
                            <div class="ppt-flip-item" @click="setFlip('flipV')">
                                <PPTIcon icon="flipV" :size="28" />
                                <div class="ppt-flip-text">垂直翻转</div>
                            </div>
                        </div>
                    </template>
                </a-popover>
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, Ref } from "vue";
import { STORAGE_FLIP } from "@/utils/storage";
import Editor from "@/plugins/editor";
import PPTIcon from "@/components/Icon.vue";

const instance = inject<Ref<Editor>>("instance");

const flip = ref(localStorage.getItem(STORAGE_FLIP) || "flipH");
const title = computed(() =>
    flip.value === "flipH" ? "水平翻转" : "垂直翻转"
);
const showEvert = ref(false);
const hoverEvert = ref(false);

const setFlip = (flipText: string) => {
    if (flipText === "flipH") {
        instance?.value.command.executeFlipH();
    } else {
        instance?.value.command.executeFlipV();
    }
    localStorage.setItem(STORAGE_FLIP, flipText);
    flip.value = flipText;
    showEvert.value = false;
};
</script>

<style lang="scss" scoped>
.ppt-tool-multifunction {
    .ppt-tool-block {
        padding: 0 2px;
        position: relative;
        .fill-color-line {
            position: absolute;
            width: 12px;
            height: 3.5px;
            bottom: 4px;
            left: 9px;
        }
    }
}

.ppt-flip-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 110px;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 16px 0 12px;
    &:hover {
        background-color: #41464b0d;
    }
    .ppt-flip-text {
        margin-top: 2px;
    }
}

.ppt-evert-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}
</style>
