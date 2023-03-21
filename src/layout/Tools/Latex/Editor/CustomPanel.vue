<template>
    <div>
        <div
            class="custom-latex-block"
            v-for="(item, index) in customFormula"
            :key="index"
        >
            <div class="custom-latex-title">
                {{ item.title }}
            </div>
            <div
                class="custom-latex-item"
                v-for="formula in item.list"
                :key="formula.text"
                @click="selectFormula(formula.text)"
            >
                <img :src="formula.url" alt="" />
            </div>
        </div>
    </div>
</template>

<script name="CustomPanel" lang="ts" setup>
import { customFormula } from "../config/custom";

const emit = defineEmits(["input"]);

const selectFormula = (formula: string) => {
    emit("input", formula);
};
</script>

<style lang="scss" scoped>
.custom-latex-block {
    .custom-latex-title {
        font-size: 16px;
        padding: 5px;
        margin-bottom: 5px;
    }

    .custom-latex-item {
        padding: 8px 0;
        box-sizing: border-box;
        background-color: #f9f9f9;
        margin-bottom: 10px;
        display: inline-block;
        margin-right: 10px;
        border-radius: 3px;
        min-width: 36px;
        cursor: pointer;
        img {
            height: 20px;
            display: block;
            margin: 0 auto;
        }
        &:hover {
            background-color: #d9d9d9;
        }
    }
}
</style>
