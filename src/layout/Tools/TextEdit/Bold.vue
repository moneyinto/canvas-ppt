<template>
    <div class="ppt-edit-tools">
       <a-tooltip title="粗体">
            <div
                class="ppt-tool-btn"
                :class="isBold && 'active'"
                @click="setFontWeight()"
            >
                <PPTIcon icon="boldFont" :size="28" />
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, onUnmounted, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTShapeElement, IPPTTextElement } from "@/types/element";
import { IFontData } from "@/types/font";
import PPTIcon from "@/components/Icon.vue";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontWeightChange = (bold) => {
        isBold.value = bold;
        emitter.emit(EmitterEvents.FONT_WEIGHT_CHANGE, isBold.value);
    };
}

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const isBold = ref(false);

const getContentBold = (texts: IFontData[]) => {
    let isBold = true;
    for (const text of texts) {
        if (text.fontWeight === "normal" && text.value !== "\n") {
            // 存在没加粗的 结束循环
            isBold = false;
            break;
        }
    }
    return isBold;
};

const init = () => {
    const operateElements = props.elements.filter(element => (element.type === "text" || element.type === "shape")) as (IPPTTextElement | IPPTShapeElement)[];
    if (operateElements.length > 0) {
        isBold.value = true;
        for (const operateElement of operateElements) {
            isBold.value = operateElement.content.length > 1 ? getContentBold(operateElement.content) : false;
            if (!isBold.value) break;
        }
    }
    emitter.emit(EmitterEvents.FONT_WEIGHT_CHANGE, isBold.value);
};

init();

watch(() => props.elements, init);

const setFontWeight = () => {
    isBold.value = !isBold.value;
    instance?.value.command.executeSetFontWeight(isBold.value);
    emitter.emit(EmitterEvents.FONT_WEIGHT_CHANGE, isBold.value);
};

const onFontWeightChange = (bold: boolean) => {
    isBold.value = bold;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_WEIGHT_CHANGE, onFontWeightChange);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.FONT_WEIGHT_CHANGE, onFontWeightChange);
});
</script>

<style lang="scss" scoped>
.ppt-tool-btn {
    &.active {
        border-color: #ccc;
        background-color: #ececec;
    }
}
</style>
