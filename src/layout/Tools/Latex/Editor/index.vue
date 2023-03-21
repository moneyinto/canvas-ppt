<template>
    <div class="latex-editor-container">
        <div class="latex-editor-body">
            <div class="latex-editor-input">
                <textarea v-model="latex" placeholder="请输入您的LaTeX表达式" ref="textareaRef"></textarea>
            </div>
            <div class="latex-preview" :class="!latex && 'empty'">
                <MathJax ref="mathJaxRef" :latex="previewLatex" />
            </div>
        </div>
        <div class="latex-editor-panel">
            <div class="latex-panel-header">
                <div
                    class="latex-header-item"
                    :class="tab === 'style' && 'active'"
                    @click="tab = 'style'"
                >
                    样式
                </div>
                <div
                    class="latex-header-item"
                    :class="tab === 'custom' && 'active'"
                    @click="tab = 'custom'"
                >
                    常用
                </div>
                <div
                    class="latex-header-item"
                    :class="tab === 'preset' && 'active'"
                    @click="tab = 'preset'"
                >
                    预置
                </div>
            </div>
            <div class="latex-panel-body">
                <StylePanel
                    v-model:color="color"
                    v-model:fontSize="fontSize"
                    v-model:fontStyle="fontStyle"
                    v-show="tab === 'style'"
                />
                <CustomPanel
                    @input="onInsetFormula"
                    v-show="tab === 'custom'"
                />
                <PresetPanel
                    @input="onInputFormula"
                    v-show="tab === 'preset'"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import MathJax from "@/components/MathJax.vue";
import StylePanel from "./StylePanel.vue";
import CustomPanel from "./CustomPanel.vue";
import PresetPanel from "./PresetPanel.vue";
import { ref, computed } from "vue";

const tab = ref("style");
const latex = ref("");
const color = ref("#444444");
const fontSize = ref("Large");
const fontStyle = ref("mathrm");
const textareaRef = ref<HTMLTextAreaElement>();

const previewLatex = computed(() => {
    return `\\${fontSize.value} { \\${fontStyle.value} { { \\color{${color.value}} ${latex.value} } } }`;
});

const onInputFormula = (formula: string) => {
    latex.value = formula;
};

const onInsetFormula = (formula: string) => {
    const start = textareaRef.value?.selectionStart || 0;
    const end = latex.value.length;
    latex.value = latex.value.substring(0, start) + formula + latex.value.substring(start, end);
    // textareaRef.value?.setSelectionRange(1, 3);
    textareaRef.value?.focus();
};

const mathJaxRef = ref();

const getEditorContent = () => {
    if (!latex.value) return { latex: "", src: "" };
    const src = mathJaxRef.value.getLatexImageBase64();
    return {
        latex: latex.value,
        src
    };
};

defineExpose({ getEditorContent });
</script>

<style lang="scss" scoped>
.latex-editor-container {
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    color: #666;
}

.latex-editor-body {
    display: flex;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    flex-direction: column;
}

.latex-editor-input {
    flex: 2;
    min-height: 0;
    border: 1px solid #eee;
    textarea {
        resize: none;
        border: none;
        outline: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 10px 15px;
        font-size: 16px;
    }
}

.latex-preview {
    flex: 1;
    min-height: 0;
    margin-top: 20px;
    border: 1px solid #eee;
    display: flex;
    align-items: center;
    padding: 0 20px;
    overflow-x: auto;
    &.empty {
        background-image: url("../../../../assets/latex/empty_latex.png");
        background-repeat: no-repeat;
        background-position: center center;
    }
}

.latex-editor-panel {
    width: 300px;
    margin-left: 20px;
    border: 1px solid #eee;
    display: flex;
    flex-direction: column;
    .latex-panel-header {
        display: flex;
        height: 50px;
        border-bottom: 1px solid #eee;
        .latex-header-item {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
            background-color: #f9f9f9;
            &.active {
                background-color: #fff;
            }
        }
    }
    .latex-panel-body {
        flex: 1;
        min-height: 0;
        box-sizing: border-box;
        padding: 10px;
        overflow-y: auto;
    }
}
</style>
