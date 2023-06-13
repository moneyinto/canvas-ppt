<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="文本颜色" :visible="!showFontColor && hoverFontColor">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverFontColor = true"
                @mouseleave="hoverFontColor = false"
            >
                <div
                    class="ppt-tool-block"
                    @click="setFontColor(cacheFontColor)"
                >
                    <SvgIcon name="fontColor" :size="26" />
                    <div
                        class="font-color-line"
                        :style="{ background: cacheFontColor }"
                    ></div>
                </div>

                <a-popover trigger="click" v-model:visible="showFontColor">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showFontColor = !showFontColor"
                    >
                        <SvgIcon name="down" :size="6" />
                    </div>

                    <template #content>
                        <div class="ppt-font-content" @keydown.stop tabindex="0">
                           <ColorBoard
                                :color="currentColor"
                                @change="onChangeColor"
                            />
                        </div>
                    </template>
                </a-popover>
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { THEME_COLOR } from "@/plugins/config/stage";
import { inject, onMounted, onUnmounted, Ref, ref } from "vue";
import ColorBoard from "@/components/ColorBoard.vue";
import { STORAGE_FONT_COLOR } from "@/utils/storage";
import Editor from "@/plugins/editor";
import SvgIcon from "@/components/SvgIcon.vue";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

const cacheFontColor = ref(
    localStorage.getItem(STORAGE_FONT_COLOR) || THEME_COLOR
);
const currentColor = ref(THEME_COLOR);
const showFontColor = ref(false);
const hoverFontColor = ref(false);

const setFontColor = (color?: string, noClose?: boolean) => {
    instance?.value.command.executeSetFontColor(color || "");
    emitter.emit(EmitterEvents.FONT_COLOR_CHANGE, color || "");
    if (!noClose) showFontColor.value = false;
};

const onChangeColor = (
    args: Parameters<(color: string, noClose?: boolean) => void>
) => {
    const [color, noClose] = args;
    setFontColor(color, noClose);
    // 缓存操作颜色
    if (color) {
        localStorage.setItem(STORAGE_FONT_COLOR, color);
        cacheFontColor.value = color;
    }
};

const onFontColorChange = (color: string) => {
    currentColor.value = color;
    cacheFontColor.value = color;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_COLOR_CHANGE, onFontColorChange);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.FONT_COLOR_CHANGE, onFontColorChange);
});
</script>

<style lang="scss" scoped>
.ppt-tool-multifunction {
    .ppt-tool-block {
        padding: 0 2px;
        position: relative;
        .font-color-line {
            position: absolute;
            width: 12px;
            height: 3.5px;
            bottom: 4px;
            left: 9px;
        }
    }
}

.ppt-font-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}
</style>
