<template>
    <div class="ppt-edit-tools">
       <a-tooltip title="下划线">
            <div
                class="ppt-tool-btn"
                :class="isUnderLine && 'active'"
                @click="setFontUnderLine()"
            >
                <PPTIcon icon="underline" :size="28" />
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
    instance.value.listener.onFontUnderLineChange = (underline) => {
        isUnderLine.value = underline;
    };
}

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const isUnderLine = ref(false);

const getContentUnderLine = (texts: IFontData[]) => {
    let isUnderLine = true;
    for (const text of texts) {
        if (!text.underline && text.value !== "\n") {
            isUnderLine = false;
            break;
        }
    }
    return isUnderLine;
};

const init = () => {
    const operateElements = props.elements.filter(element => element.type === "text") as IPPTTextElement[];
    if (operateElements.length > 0) {
        isUnderLine.value = true;
        for (const operateElement of operateElements) {
            isUnderLine.value = getContentUnderLine(operateElement.content);
            if (!isUnderLine.value) break;
        }
    }
};

init();

watch(() => props.elements, init);

const setFontUnderLine = () => {
    isUnderLine.value = !isUnderLine.value;
    instance?.value.command.executeSetFontUnderLine(isUnderLine.value);
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
