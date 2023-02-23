<template>
    <div class="ppt-edit-tools">
       <a-tooltip title="删除线">
            <div
                class="ppt-tool-btn"
                :class="isStrikout && 'active'"
                @click="setFontStrikout()"
            >
                <PPTIcon icon="strikout" :size="28" />
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
    instance.value.listener.onFontStrikoutChange = (strikout) => {
        isStrikout.value = strikout;
    };
}

const props = defineProps({
    element: {
        type: Object as PropType<IPPTElement | null>,
        required: true
    }
});

const isStrikout = ref(false);

const getContentStrikout = (texts: IFontData[]) => {
    let isStrikout = true;
    for (const text of texts) {
        if (!text.strikout) {
            isStrikout = false;
            break;
        }
    }
    return isStrikout;
};

const init = () => {
    if (props.element && props.element.type === "text") {
        const operateElement = props.element;
        isStrikout.value = getContentStrikout(operateElement.content);
    }
};

init();

watch(() => props.element, init);

const setFontStrikout = () => {
    isStrikout.value = !isStrikout.value;
    instance?.value.command.executeSetFontStrikout(isStrikout.value);
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
