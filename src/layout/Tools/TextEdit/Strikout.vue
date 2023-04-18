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
import { inject, onMounted, onUnmounted, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { IPPTElement, IPPTTextElement } from "@/types/element";
import { IFontData } from "@/types/font";
import PPTIcon from "@/components/Icon.vue";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontStrikoutChange = (strikout) => {
        isStrikout.value = strikout;
        emitter.emit(EmitterEvents.FONT_STRIKOUT_CHANGE, isStrikout.value);
    };
}

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const isStrikout = ref(false);

const getContentStrikout = (texts: IFontData[]) => {
    let isStrikout = true;
    for (const text of texts) {
        if (!text.strikout && text.value !== "\n") {
            isStrikout = false;
            break;
        }
    }
    return isStrikout;
};

const init = () => {
    const operateElements = props.elements.filter(element => element.type === "text") as IPPTTextElement[];
    if (operateElements.length > 0) {
        isStrikout.value = true;
        for (const operateElement of operateElements) {
            isStrikout.value = operateElement.content.length > 1 ? getContentStrikout(operateElement.content) : false;
            if (!isStrikout.value) break;
        }
    }
    emitter.emit(EmitterEvents.FONT_STRIKOUT_CHANGE, isStrikout.value);
};

init();

watch(() => props.elements, init);

const setFontStrikout = () => {
    isStrikout.value = !isStrikout.value;
    instance?.value.command.executeSetFontStrikout(isStrikout.value);
    emitter.emit(EmitterEvents.FONT_STRIKOUT_CHANGE, isStrikout.value);
};

const onFontStrikoutChange = (strikout: boolean) => {
    isStrikout.value = strikout;
};

onMounted(() => {
    emitter.on(EmitterEvents.FONT_STRIKOUT_CHANGE, onFontStrikoutChange);
});

onUnmounted(() => {
    emitter.on(EmitterEvents.FONT_STRIKOUT_CHANGE, onFontStrikoutChange);
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
