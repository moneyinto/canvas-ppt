<template>
    <div class="mathjax-container">
        <div ref="mathjaxRef"></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { initMathJax } from "@/utils/mathjax";

const mathjaxRef = ref<HTMLDivElement>();

const props = defineProps({
    latex: {
        type: String,
        default: ""
    }
});

let targetSvg: Node | null = null;

const renderMathJax = () => {
    initMathJax({}, async () => {
        try {
            const node = await window.MathJax.tex2svg(props.latex, {});
            const elsvg = node.firstElementChild;
            elsvg.removeAttribute("style");
            elsvg.removeAttribute("focusable");
            elsvg.removeAttribute("role");
            targetSvg = elsvg;
            if (mathjaxRef.value) {
                mathjaxRef.value.innerHTML = "";
                mathjaxRef.value.appendChild(elsvg);
            }
        } catch (err) {
            console.log("渲染内容非法");
        }
    });
};

const getLatexImageBase64 = () => {
    if (!targetSvg) return "";
    return "data:image/svg+xml;base64," + window.btoa(new XMLSerializer().serializeToString(targetSvg));
};

defineExpose({ getLatexImageBase64 });

renderMathJax();

watch(() => props.latex, () => {
    renderMathJax();
});
</script>

<style lang="scss" scoped>
.mathjax-container {
    margin: 0 auto;
}
</style>
