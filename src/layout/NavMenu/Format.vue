<template>
    <a-dropdown
        v-model:visible="formatVisible"
        overlayClassName="ppt-format-menu"
        placement="bottomLeft"
        trigger="click"
    >
        <div class="ppt-menu-item">格式</div>
        <template #overlay>
            <a-menu triggerSubMenuAction="click">
                <a-sub-menu :disabled="fontDisabled" key="sub-text">
                    <template #title>
                        <div class="ppt-menu-option">
                            <div style="width: 28px; height: 26px"></div>
                            &nbsp;&nbsp;文字
                        </div>
                    </template>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="setFontWeight()">
                            <PPTIcon icon="boldFont" :size="28" />
                            &nbsp;&nbsp;加粗
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="setFontStyle()">
                            <PPTIcon icon="italicFont" :size="28" />
                            &nbsp;&nbsp;斜体
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option" @click="setFontUnderLine()">
                            <PPTIcon icon="underline" :size="28" />
                            &nbsp;&nbsp;下划线
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option">
                            <PPTIcon icon="strikout" :size="28" />
                            &nbsp;&nbsp;中划线
                        </div>
                    </a-menu-item>
                    <a-divider class="ppt-menu-divider"></a-divider>
                    <a-sub-menu key="sub-font">
                        <template #title>
                            <div class="ppt-menu-option">
                                <div style="width: 28px; height: 26px"></div>
                                &nbsp;&nbsp;字体
                            </div>
                        </template>
                        <a-menu-item
                            v-for="font in availableFonts"
                            :key="font.value"
                        >
                            <div
                                class="ppt-menu-option ppt-menu-checked"
                                @click="setFontFamily(font.value)"
                            >
                                {{ font.label }}

                                <PPTIcon
                                    class="font-checked"
                                    :class="
                                        fontFamily == font.value && 'active'
                                    "
                                    icon="checked"
                                    :size="28"
                                />
                            </div>
                        </a-menu-item>
                    </a-sub-menu>
                    <a-sub-menu key="sub-font-size">
                        <template #title>
                            <div class="ppt-menu-option">
                                <div style="width: 28px; height: 26px"></div>
                                &nbsp;&nbsp;字号
                            </div>
                        </template>
                        <a-menu-item v-for="size in sizes" :key="size">
                            <div
                                class="ppt-menu-option ppt-menu-checked"
                                @click="setFontSize(size)"
                            >
                                {{ size }}

                                <PPTIcon
                                    class="font-checked"
                                    :class="fontSize == size && 'active'"
                                    icon="checked"
                                    :size="28"
                                />
                            </div>
                        </a-menu-item>
                    </a-sub-menu>
                </a-sub-menu>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script lang="ts" setup>
import {
    computed,
    inject,
    onMounted,
    onUnmounted,
    PropType,
    ref,
    Ref,
    watch
} from "vue";
import Editor from "@/plugins/editor";
import PPTIcon from "@/components/Icon.vue";
import { IPPTElement } from "@/types/element";
import { SYS_FONTS } from "@/plugins/config/font";
import { isSupportFont } from "@/utils";
import emitter, { EmitterEvents } from "@/utils/emitter";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const formatVisible = ref(false);
const instance = inject<Ref<Editor>>("instance");
const fontDisabled = ref(true);

const elements = computed(() => props.elements);
const fontFamily = ref("");
const availableFonts = ref(
    SYS_FONTS.filter((font) => isSupportFont(font.value))
);
const setFontFamily = (font: string) => {
    formatVisible.value = false;
    fontFamily.value = font;
    instance?.value.command.executeSetFontFamily(font);
    emitter.emit(EmitterEvents.FONT_FAMILY_CHANGE, font);
};
const onFontFamilyChange = (font: string) => {
    fontFamily.value = font;
};

const fontSize = ref();
const sizes = ref([
    8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 66, 72
]);
const setFontSize = (size: number) => {
    formatVisible.value = false;
    fontSize.value = size;
    instance?.value.command.executeSetFontSize(size);
    emitter.emit(EmitterEvents.FONT_SIZE_CHANGE, size);
};
const onFontSizeChange = (size: string | number) => {
    fontSize.value = size;
};

const isBold = ref(false);
const setFontWeight = () => {
    formatVisible.value = false;
    isBold.value = !isBold.value;
    instance?.value.command.executeSetFontWeight(isBold.value);
    emitter.emit(EmitterEvents.FONT_WEIGHT_CHANGE, isBold.value);
};
const onFontWeightChange = (bold: boolean) => {
    isBold.value = bold;
};

const isItalic = ref(false);
const setFontStyle = () => {
    formatVisible.value = false;
    isItalic.value = !isItalic.value;
    instance?.value.command.executeSetFontStyle(isItalic.value);
    emitter.emit(EmitterEvents.FONT_ITALIC_CHANGE, isItalic.value);
};
const onFontStyleChange = (italic: boolean) => {
    isItalic.value = italic;
};

const isUnderLine = ref(false);
const setFontUnderLine = () => {
    isUnderLine.value = !isUnderLine.value;
    instance?.value.command.executeSetFontUnderLine(isUnderLine.value);
    emitter.emit(EmitterEvents.FONT_UNDERLINE_CHANGE, isUnderLine.value);
};
const onFontUnderLineChange = (underLine: boolean) => {
    isUnderLine.value = underLine;
};

watch(elements, () => {
    if (elements.value.length > 0) {
        fontDisabled.value =
            elements.value.filter((element) => element.type === "text")
                .length === 0;
    } else {
        fontDisabled.value = true;
    }
});

onMounted(() => {
    emitter.on(EmitterEvents.FONT_FAMILY_CHANGE, onFontFamilyChange);
    emitter.on(EmitterEvents.FONT_SIZE_CHANGE, onFontSizeChange);
    emitter.on(EmitterEvents.FONT_WEIGHT_CHANGE, onFontWeightChange);
    emitter.on(EmitterEvents.FONT_ITALIC_CHANGE, onFontStyleChange);
    emitter.on(EmitterEvents.FONT_UNDERLINE_CHANGE, onFontUnderLineChange);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.FONT_FAMILY_CHANGE, onFontFamilyChange);
    emitter.off(EmitterEvents.FONT_SIZE_CHANGE, onFontSizeChange);
    emitter.on(EmitterEvents.FONT_WEIGHT_CHANGE, onFontWeightChange);
    emitter.on(EmitterEvents.FONT_ITALIC_CHANGE, onFontStyleChange);
    emitter.on(EmitterEvents.FONT_UNDERLINE_CHANGE, onFontUnderLineChange);
});
</script>

<style lang="scss">
.ant-dropdown-menu-item-disabled .ppt-icon {
    opacity: 0.4;
}

.ppt-menu-checked {
    justify-content: space-between;
}

.ppt-format-menu {
    .ant-dropdown-menu-submenu-expand-icon {
        top: 6px;
    }

    .ppt-menu-divider {
        margin: 4px 0;
    }

    .font-checked {
        visibility: hidden;
        &.active {
            visibility: visible;
        }
    }
}
</style>
