<template>
    <a-modal
        title="公式"
        width="80%"
        height="80%"
        okText="确认"
        cancelText="取消"
        class="ppt-latex-dialog"
        @ok="sure"
    >
        <Editor :element="element" ref="editor" />
    </a-modal>
</template>

<script lang="ts" setup>
import { IPPTLatexElement } from "@/types/element";
import { message } from "ant-design-vue";
import { PropType, ref, toRefs } from "vue";
import Editor from "./Editor/index.vue";

const editor = ref();

const emit = defineEmits(["ok"]);

const props = defineProps({
    element: {
        type: Object as PropType<IPPTLatexElement>
    }
});

const { element } = toRefs(props);

const sure = () => {
    const result = editor.value.getEditorContent();
    if (!result.src) {
        message.info("请输入您的LaTeX表达式");
    } else {
        emit("ok", result);
    }
};
</script>

<style lang="scss">
.ppt-latex-dialog {
    padding-bottom: 0;
    top: 10%;
    .ant-modal-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        .ant-modal-body {
            flex: 1;
            min-height: 0;
        }
    }
}
</style>
