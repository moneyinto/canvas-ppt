<template>
    <div class="ppt-edit-tools">
        <a-popover trigger="click" v-model:visible="showFontFamily">
            <a-tooltip
                title="字体"
                :visible="!showFontFamily && hoverFontFamilyPool"
            >
                <div
                    class="ppt-tool-btn"
                    @mouseover="hoverFontFamilyPool = true"
                    @mouseleave="hoverFontFamilyPool = false"
                >
                    <div class="ppt-family-input">
                        {{ font || "字体" }}
                    </div>

                    <PPTIcon icon="down" :size="6" />
                </div>
            </a-tooltip>

            <template #content>
                <div class="ppt-family-content" @keydown.stop tabindex="0">
                    <div
                        class="ppt-family-item"
                        v-for="font in availableFonts"
                        :key="font.value"
                        @click="setFontFamily(font.value)"
                    >
                        {{ font.label }}
                        <PPTIcon
                            class="font-family-checked"
                            :class="fontFamily == font.value && 'active'"
                            icon="checked"
                            :size="28"
                        />
                    </div>
                </div>
            </template>
        </a-popover>
    </div>
</template>

<script lang="ts" setup>
import { computed, inject, PropType, ref, Ref } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement } from "@/types/element";
import PPTIcon from "@/components/Icon.vue";
import useFontFamilyHandler from "@/hooks/useFontFamilyHandler";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontFamilyChange = (font) => {
        fontFamily.value = font;
    };
}

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const showFontFamily = ref(false);
const hoverFontFamilyPool = ref(false);
const elements = computed(() => props.elements);
const { availableFonts, font, fontFamily } = useFontFamilyHandler(elements);

const setFontFamily = (font: string) => {
    showFontFamily.value = false;
    fontFamily.value = font;
    instance?.value.command.executeSetFontFamily(font);
};
</script>

<style lang="scss" scoped>
.ppt-family-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}

.ppt-tool-btn {
    padding: 0 5px;
    width: 100px;
}

.ppt-family-input {
    padding: 0;
    outline: 0;
    box-shadow: none !important;
    border: none;
    font-size: 12px;
    background-color: transparent;
    line-height: 18px;
    height: 18px;
    margin-top: 2px;
    cursor: pointer;
    flex: 1;
}

.ppt-family-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 120px;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 15px;
    &:hover {
        background-color: #f6f6f6;
    }
}

.font-family-checked {
    visibility: hidden;
    &.active {
        visibility: visible;
    }
}
</style>
