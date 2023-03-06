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
import { inject, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTTextElement } from "@/plugins/types/element";
import { IFontData } from "@/plugins/types/font";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontWeightChange = (bold) => {
        isBold.value = bold;
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
    const operateElements = props.elements.filter(element => element.type === "text") as IPPTTextElement[];
    if (operateElements.length > 0) {
        isBold.value = true;
        for (const operateElement of operateElements) {
            isBold.value = getContentBold(operateElement.content);
            if (!isBold.value) break;
        }
    }
};

init();

watch(() => props.elements, init);

const setFontWeight = () => {
    isBold.value = !isBold.value;
    instance?.value.command.executeSetFontWeight(isBold.value);
};
</script>

<style lang="scss" scoped>
.ppt-tool-btn {
    &.active {
        border-color: #ccc;
        background-color: #ececec;
    }
}
</style>