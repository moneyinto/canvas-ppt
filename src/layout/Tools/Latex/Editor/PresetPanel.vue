<template>
    <div>
        <div
            class="preset-latex-block"
            v-for="(item, index) in presetFormula"
            :key="index"
        >
            <div class="preset-latex-title">
                {{ item.title }}
            </div>
            <div
                class="preset-latex-item"
                v-for="formula in item.list"
                :key="formula.text"
                @click="selectFormula(formula.text)"
            >
                <img :src="formula.url" alt="" />
            </div>
        </div>
    </div>
</template>

<script name="PresetPanel" lang="ts" setup>
import { presetFormula } from "../config/preset";

const emit = defineEmits(["input"]);

const selectFormula = (formula: string) => {
    emit("input", formula);
};
</script>

<style lang="scss" scoped>
.preset-latex-block {
    .preset-latex-title {
        font-size: 16px;
        padding: 5px;
        margin-bottom: 5px;
    }

    .preset-latex-item {
        padding: 10px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        margin-bottom: 10px;
        cursor: pointer;
        img {
            width: 100%;
            display: block;
        }
    }
}
</style>
