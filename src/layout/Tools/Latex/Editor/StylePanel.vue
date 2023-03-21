<template>
    <div class="style-edit-panel">
        <div class="style-edit-line">
            <div class="style-edit-title">公式颜色</div>
            <div class="style-edit-content">
                <input
                    class="style-color-view"
                    type="color"
                    v-model="color"
                    @input="onChangeColor"
                />
            </div>
        </div>

        <div class="style-edit-line">
            <div class="style-edit-title">公式字体</div>
            <div class="style-edit-content">
                <div
                    class="style-font-item"
                    :class="fontStyle === font.text && 'active'"
                    v-for="font in fonts"
                    :key="font.text"
                    @click="selectFontStyle(font.text)"
                >
                    <img :src="font.url" alt="" />
                </div>
            </div>
        </div>

        <div class="style-edit-line">
            <div class="style-edit-title">公式大小</div>
            <div class="style-edit-content">
                <div
                    class="style-font-item"
                    :class="fontSize === size.text && 'active'"
                    v-for="size in fontSizes"
                    :key="size.text"
                    @click="selectFontSize(size.text)"
                >
                    <img :src="size.url" alt="" />
                </div>
            </div>
        </div>
    </div>
</template>

<script name="StylePanel" lang="ts" setup>
import { ref, computed } from "vue";
import { fonts } from "../config/font";
import { fontSizes } from "../config/fontSize";

const props = defineProps({
    color: {
        type: String,
        default: "#444444"
    },

    fontStyle: {
        type: String,
        default: "mathrm"
    },

    fontSize: {
        type: String,
        default: "small"
    }
});

const emit = defineEmits(["update:color", "update:fontStyle", "update:fontSize"]);

const color = ref(props.color);
const fontStyle = computed(() => props.fontStyle);
const fontSize = computed(() => props.fontSize);

const onChangeColor = () => {
    emit("update:color", color.value);
};

const selectFontStyle = (fontStyle: string) => {
    emit("update:fontStyle", fontStyle);
};

const selectFontSize = (fontSize: string) => {
    emit("update:fontSize", fontSize);
};
</script>

<style lang="scss" scoped>
.style-edit-line {
    padding: 10px;
    margin-bottom: 10px;
    .style-edit-title {
        font-size: 14px;
        margin-bottom: 5px;
    }
    .style-edit-content {
        .style-color-view {
            border: 1px solid #d9d9d9;
            background: #fff;
            padding: 0;
            width: 100%;
            height: 36px;
            cursor: pointer;
            padding: 3px 7px;
        }

        .style-font-item {
            background-color: #f7f7f7;
            padding: 10px;
            box-sizing: border-box;
            margin-bottom: 10px;
            cursor: pointer;
            img {
                display: block;
                width: 100%;
            }
            &.active,
            &:hover {
                background-color: #d9d9d9;
            }
        }
    }
}
</style>
