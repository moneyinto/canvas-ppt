<template>
    <a-dropdown v-model:visible="fileVisible" placement="bottomLeft" trigger="click">
        <div class="ppt-menu-item">文件</div>
        <template #overlay>
            <a-menu @click="handleDropdown">
                <a-menu-item>
                    <div class="ppt-menu-option">&nbsp;&nbsp;导入mpptx</div>
                </a-menu-item>
                <a-menu-item key="exportMpptx">
                    <div class="ppt-menu-option">&nbsp;&nbsp;导出mpptx</div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item>
                    <div class="ppt-menu-option">&nbsp;&nbsp;导入pptx</div>
                </a-menu-item>
                <a-menu-item>
                    <div class="ppt-menu-option">&nbsp;&nbsp;导出pptx</div>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>

    <div class="loading-fullscreen" v-if="exporting">
        <div class="loading-box">
            <a-spin size="large"></a-spin>
            <a-progress
                :strokeWidth="16"
                :percent="exportPercent"
                status="active"
                :show-info="false"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import Editor from "@/plugins/editor";
import { Ref, inject, ref } from "vue";
import useExport from "@/hooks/useExport";
import { MenuInfo } from "ant-design-vue/lib/menu/src/interface";

const instance = inject<Ref<Editor>>("instance");
const fileVisible = ref(false);
const exporting = ref(false);
const exportPercent = ref(0);

const { outputMPPTX } = useExport(instance, exporting, exportPercent);

const handleDropdown = (e: MenuInfo) => {
    fileVisible.value = false;
    switch (e.key) {
        case "exportMpptx": {
            outputMPPTX();
            break;
        }
    }
};
</script>

<style lang="scss" scoped>
.loading-fullscreen {
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;

    .loading-box {
        width: 400px;
        text-align: center;
        height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
}
</style>
