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
import { computed, inject, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTTextElement } from "@/plugins/types/element";
import { IFontData } from "@/plugins/types/font";
import { isSupportFont } from "@/utils";

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

const SYS_FONTS = [
    { label: "Arial", value: "Arial" },
    { label: "微软雅黑", value: "Microsoft YaHei" },
    { label: "宋体", value: "SimSun" },
    { label: "黑体", value: "SimHei" },
    { label: "楷体", value: "KaiTi" },
    { label: "新宋体", value: "NSimSun" },
    { label: "仿宋", value: "FangSong" },
    { label: "苹方", value: "PingFang SC" },
    { label: "华文黑体", value: "STHeiti" },
    { label: "华文楷体", value: "STKaiti" },
    { label: "华文宋体", value: "STSong" },
    { label: "华文仿宋", value: "STFangSong" },
    { label: "华文中宋", value: "STZhongSong" },
    { label: "华文琥珀", value: "STHupo" },
    { label: "华文新魏", value: "STXinwei" },
    { label: "华文隶书", value: "STLiti" },
    { label: "华文行楷", value: "STXingkai" },
    { label: "冬青黑体", value: "Hiragino Sans GB" },
    { label: "兰亭黑", value: "Lantinghei SC" },
    { label: "偏偏体", value: "Hanzipen SC" },
    { label: "手札体", value: "Hannotate SC" },
    { label: "宋体", value: "Songti SC" },
    { label: "娃娃体", value: "Wawati SC" },
    { label: "行楷", value: "Xingkai SC" },
    { label: "圆体", value: "Yuanti SC" },
    { label: "华文细黑", value: "STXihei" },
    { label: "幼圆", value: "YouYuan" },
    { label: "隶书", value: "LiSu" }
];

const availableFonts = ref(SYS_FONTS.filter(font => isSupportFont(font.value)));

const showFontFamily = ref(false);
const hoverFontFamilyPool = ref(false);
const fontFamily = ref("");
const font = computed(() => availableFonts.value.find(font => font.value === fontFamily.value)?.label);

const getContentFontFamily = (texts: IFontData[]) => {
    let fontFamily = "";
    for (const text of texts) {
        if (fontFamily === "") {
            fontFamily = text.fontFamily;
        } else if (fontFamily !== text.fontFamily) {
            // 存在不一样的字体 结束循环
            fontFamily = "";
            break;
        }
    }
    return fontFamily;
};

const init = () => {
    const operateElements = props.elements.filter(element => element.type === "text") as IPPTTextElement[];
    if (operateElements.length > 0) {
        for (const [index, operateElement] of operateElements.entries()) {
            if (index === 0) {
                fontFamily.value = getContentFontFamily(operateElement.content);
            } else {
                if (fontFamily.value !== getContentFontFamily(operateElement.content)) {
                    fontFamily.value = "";
                    break;
                }
            }
        }
    }
};

init();

watch(() => props.elements, init);

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
