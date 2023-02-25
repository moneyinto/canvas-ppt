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
import { IPPTElement } from "@/plugins/types/element";
import { IFontData } from "@/plugins/types/font";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontUnderLineChange = (underline) => {
        isUnderLine.value = underline;
    };
}

const props = defineProps({
    element: {
        type: Object as PropType<IPPTElement>
    }
});

const isUnderLine = ref(false);

const getContentUnderLine = (texts: IFontData[]) => {
    let isUnderLine = true;
    for (const text of texts) {
        if (!text.underline) {
            isUnderLine = false;
            break;
        }
    }
    return isUnderLine;
};

const init = () => {
    if (props.element && props.element.type === "text") {
        const operateElement = props.element;
        isUnderLine.value = getContentUnderLine(operateElement.content);
    }
};

init();

watch(() => props.element, init);

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
