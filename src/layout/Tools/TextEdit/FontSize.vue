<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="字号" :visible="!showFontSize && hoverFontSize">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverFontSize = true"
                @mouseleave="hoverFontSize = false"
            >
                <div class="ppt-input-box">
                    <a-input
                        class="ppt-size-input"
                        placeholder="字号"
                        v-model:value="fontSize"
                        type="number"
                        :max="72"
                        :min="8"
                        @change="onSizeChange()"
                    ></a-input>
                </div>
                <a-popover trigger="click" v-model:visible="showFontSize">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showFontSize = !showFontSize"
                    >
                        <PPTIcon icon="down" :size="6" />
                    </div>

                    <template #content>
                        <div
                            class="ppt-size-content"
                            @keydown.stop
                            tabindex="0"
                        >
                            <div
                                class="ppt-size-item"
                                v-for="size in sizes"
                                :key="size"
                                @click="setFontSize(size)"
                            >
                                <PPTIcon
                                    class="font-size-checked"
                                    :class="fontSize == size && 'active'"
                                    icon="checked"
                                    :size="28"
                                />
                                {{ size }}
                            </div>
                        </div>
                    </template>
                </a-popover>
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { inject, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import { throttleRAF } from "@/utils";
import { IPPTElement } from "@/plugins/types/element";
import { IFontData } from "@/plugins/types/font";

const instance = inject<Ref<Editor>>("instance");

if (instance?.value) {
    instance.value.listener.onFontSizeChange = (size) => {
        fontSize.value = size;
    };
}

const props = defineProps({
    element: {
        type: Object as PropType<IPPTElement | null>,
        required: true
    }
});

const showFontSize = ref(false);
const hoverFontSize = ref(false);
const fontSize = ref();

const sizes = ref([
    8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 66, 72
]);

const getContentFontSize = (texts: IFontData[]) => {
    let fontSize: string | number = "";
    for (const text of texts) {
        if (fontSize === "") {
            fontSize = text.fontSize;
        } else if (fontSize !== text.fontSize) {
            // 存在不一样的字体大小 结束循环
            fontSize = "";
            break;
        }
    }
    return fontSize;
};

const init = () => {
    if (props.element && props.element.type === "text") {
        const operateElement = props.element;
        fontSize.value = getContentFontSize(operateElement.content);
    }
};

init();

watch(() => props.element, init);

const onSizeChange = throttleRAF(() => {
    instance?.value.command.executeSetFontSize(Number(fontSize.value));
});

const setFontSize = (size: number) => {
    showFontSize.value = false;
    fontSize.value = size;
    instance?.value.command.executeSetFontSize(size);
};
</script>

<style lang="scss" scoped>
.ppt-size-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}

.ppt-size-item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 70px;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 20px 0 12px;
}

.ppt-input-box {
    padding: 0 5px;
    width: 38px;
}

.ppt-size-input {
    padding: 0;
    outline: 0;
    box-shadow: none !important;
    border: none;
    font-size: 12px;
    background-color: transparent;
    text-align: center;
    line-height: 18px;
    height: 18px;
    margin-top: 2px;
}

/* Chrome, Safari, Edge, Opera */
.ppt-size-input::-webkit-outer-spin-button,
.ppt-size-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.ppt-size-input[type=number] {
  -moz-appearance: textfield;
}

.font-size-checked {
    margin-right: 3px;
    visibility: hidden;
    &.active {
        visibility: visible;
    }
}
</style>
