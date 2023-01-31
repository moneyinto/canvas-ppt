<template>
    <div class="ppt-color-board">
        <a-tooltip
            v-for="color in colorList"
            :key="color.value"
            :title="color.label"
        >
            <div
                class="ppt-color-block"
                @click="setColor(color.value)"
                :style="{ backgroundColor: color.value }"
            ></div>
        </a-tooltip>
    </div>

    <div class="ppt-custom-color">
        <span>自定义颜色</span>
        <div class="ppt-color-view">
            <div
                class="ppt-color-block"
                :class="!currentColor && 'no-fill-block'"
                :style="{ backgroundColor: currentColor }"
            ></div>
            <span>#</span>
            <a-input
                v-if="currentColor"
                type="text"
                class="ppt-color-input"
                v-model:value="currentInputColor"
                @blur="onBlurChange"
            ></a-input>
            <span class="no-fill-text" v-else>无填充</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import tinycolor from "tinycolor2";

const props = defineProps({
    color: {
        type: String,
        required: true
    }
});

const emit = defineEmits(["change"]);

const getColorValue = () => {
    return props.color ? tinycolor(props.color).toHex() : "";
};

const currentColor = computed(() => props.color);
const currentInputColor = ref(getColorValue());

watch(() => props.color, () => {
    currentInputColor.value = getColorValue();
});

const setColor = (color: string) => {
    emit("change", [color, true]);
};

const onBlurChange = () => {
    currentInputColor.value = tinycolor(currentInputColor.value).toHex();
    emit("change", [`#${currentInputColor.value}`]);
};

const colorList = ref([
    {
        label: "白",
        value: "#ffffff"
    },
    {
        label: "漆黑",
        value: "#0d0015"
    },
    {
        label: "红",
        value: "#fe2c23"
    },
    {
        label: "橙",
        value: "#ff9900"
    },
    {
        label: "黄",
        value: "#ffd900"
    },
    {
        label: "葱绿",
        value: "#a3e043"
    },
    {
        label: "湖蓝",
        value: "#37d9f0"
    },
    {
        label: "天色",
        value: "#4da8ee"
    },
    {
        label: "藤紫",
        value: "#956fe7"
    },
    {
        label: "白练",
        value: "#f3f3f4"
    },
    {
        label: "白鼠",
        value: "#cccccc"
    },
    {
        label: "樱",
        value: "#fef2f0"
    },
    {
        label: "缟",
        value: "#fef5e7"
    },
    {
        label: "练",
        value: "#fefcd9"
    },
    {
        label: "芽",
        value: "#edf6e8"
    },
    {
        label: "水",
        value: "#e6fafa"
    },
    {
        label: "缥",
        value: "#ebf4fc"
    },
    {
        label: "丁香",
        value: "#f0edf6"
    },
    {
        label: "灰青",
        value: "#d7d8d9"
    },
    {
        label: "鼠",
        value: "#a5a5a5"
    },
    {
        label: "虹",
        value: "#fbd4d0"
    },
    {
        label: "落柿",
        value: "#ffd7b9"
    },
    {
        label: "花叶",
        value: "#f9eda6"
    },
    {
        label: "白绿",
        value: "#d4e9d6"
    },
    {
        label: "天青",
        value: "#c7e6ea"
    },
    {
        label: "天空",
        value: "#cce0f1"
    },
    {
        label: "水晶",
        value: "#dad5e9"
    },
    {
        label: "薄钝",
        value: "#7b7f83"
    },
    {
        label: "墨",
        value: "#494949"
    },
    {
        label: "甚三红",
        value: "#ee7976"
    },
    {
        label: "珊瑚",
        value: "#faa573"
    },
    {
        label: "金",
        value: "#e6b322"
    },
    {
        label: "薄青",
        value: "#98c091"
    },
    {
        label: "白裙",
        value: "#79c6cd"
    },
    {
        label: "薄花",
        value: "#6eaad7"
    },
    {
        label: "紫苑",
        value: "#9c8ec1"
    },
    {
        label: "石墨",
        value: "#41464b"
    },
    {
        label: "黑",
        value: "#333333"
    },
    {
        label: "绯红",
        value: "#be1a1d"
    },
    {
        label: "棕黄",
        value: "#b95514"
    },
    {
        label: "土黄",
        value: "#ad720e"
    },
    {
        label: "苍翠",
        value: "#1c7231"
    },
    {
        label: "孔雀",
        value: "#1c7892"
    },
    {
        label: "琉璃",
        value: "#19439c"
    },
    {
        label: "青莲",
        value: "#511b78"
    }
]);
</script>

<style lang="scss" scoped>
.ppt-color-board {
    width: 180px;
    margin-right: -4px;
    margin-bottom: 10px;
    white-space: pre-wrap;
    margin-top: 15px;
}

.ppt-color-block {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 4px;
    cursor: pointer;
}

.ppt-custom-color {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
        color: #919397;
        font-size: 12px;
    }
}

.ppt-color-view {
    display: flex;
    align-items: center;
    .ppt-color-input {
        width: 60px;
        font-size: 12px;
        line-height: 1;
        padding: 2px 3px;
        margin-left: 3px;
    }
    .no-fill-block {
        width: 16px;
        height: 16px;
        margin-right: 4px;
        border: 1px solid #ccc;
        position: relative;
        &::before {
            content: "";
            display: block;
            position: absolute;
            width: 20px;
            border-top: 1px solid #f60000;
            transform: rotate(45deg) translateY(-0.5px);
            transform-origin: top left;
        }
    }
    .no-fill-text {
        margin-left: 3px;
        color: #333;
    }
}
</style>
