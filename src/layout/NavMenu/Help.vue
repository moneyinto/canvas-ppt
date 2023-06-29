<template>
    <a-dropdown placement="bottomLeft" trigger="click">
        <div class="ppt-menu-item">帮助</div>
        <template #overlay>
            <a-menu>
                <a-menu-item @click="goIssues()">
                    <div class="ppt-menu-option">意见反馈</div>
                </a-menu-item>
                <a-menu-item>
                    <div class="ppt-menu-option" @click="goQuestion()">
                        常见问题
                    </div>
                </a-menu-item>
                <a-menu-item @click="visible = true">
                    <div class="ppt-menu-option">快捷键</div>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>

    <a-drawer
        v-model:visible="visible"
        title="快捷键"
        placement="right"
        :closable="false"
        :width="440"
    >
        <div class="hot-key">
            <div class="hot-key-module" v-for="item in HOTKEY_DOC" :key="item.title">
                <div class="hot-key-title">{{ item.title }}</div>
                <div class="hot-key-item" v-for="child in item.children" :key="child.label">
                    <div class="hot-key-name">{{ child.label }}</div>
                    <div class="hot-key-desc">{{ child.value }}</div>
                </div>
            </div>
        </div>
    </a-drawer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { HOTKEY_DOC } from "@/config/shortcut";

const visible = ref(false);
const goIssues = () => {
    window.open("https://github.com/moneyinto/canvas-ppt/issues", "_blank");
};

const goQuestion = () => {
    window.open(
        "https://github.com/moneyinto/canvas-ppt/blob/master/doc/QUESTION.md",
        "_blank"
    );
};
</script>

<style lang="scss" scoped>
.hot-key {
    overflow-y: auto;
    height: 100%;
    .hot-key-module {
        margin-bottom: 10px;
        .hot-key-title {
            font-size: 16px;
            font-weight: bold;
            padding: 10px;
            border-bottom: 1px solid #efefef;
        }

        .hot-key-item {
            padding: 10px;
            font-size: 14px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #efefef;
            .hot-key-name, .hot-key-desc {
                flex: 1;
            }
        }
    }
}
</style>
