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
import { IPPTElement } from "@/plugins/types/element";
import { IFontData } from "@/plugins/types/font";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontBoldChange = (bold) => {
        isBold.value = bold;
    };
}

const props = defineProps({
    element: {
        type: Object as PropType<IPPTElement | null>,
        required: true
    }
});

const isBold = ref(false);

const getContentBold = (texts: IFontData[]) => {
    let isBold = false;
    for (const text of texts) {
        if (text.fontWeight === "bold") {
            isBold = true;
        } else {
            // 存在没加粗的 结束循环
            isBold = false;
            break;
        }
    }
    return isBold;
};

const init = () => {
    if (props.element && props.element.type === "text") {
        const operateElement = props.element;
        isBold.value = getContentBold(operateElement.content);
    }
};

init();

watch(() => props.element, init);

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
