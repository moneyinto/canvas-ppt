<template>
    <a-dropdown v-model:visible="fileVisible" placement="bottomLeft" trigger="click">
        <div class="ppt-menu-item">文件</div>
        <template #overlay>
            <a-menu @click="handleDropdown">
                <a-menu-item key="importMPPTX">
                    <div class="ppt-menu-option">&nbsp;&nbsp;导入mpptx</div>
                </a-menu-item>
                <a-menu-item key="exportMPPTX">
                    <div class="ppt-menu-option">&nbsp;&nbsp;导出mpptx</div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="importPPTX">
                    <div class="ppt-menu-option">&nbsp;&nbsp;导入pptx</div>
                </a-menu-item>
                <a-menu-item key="exportPPTX">
                    <div class="ppt-menu-option">&nbsp;&nbsp;导出pptx</div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item>
                    <div class="ppt-menu-option" @click="onSaveAs">
                        &nbsp;&nbsp;另存为
                    </div>
                </a-menu-item>
                <a-menu-item>
                    <div class="ppt-menu-option" @click="onSave">
                        &nbsp;&nbsp;保存
                    </div>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>

    <input class="ppt-input-file" ref="inputMPPTXRef" accept=".mpptx" type="file" @change="inputMPPTXFileChange" />
    <input class="ppt-input-file" ref="inputPPTXRef" accept=".pptx" type="file" @change="inputPPTXFileChange" />

    <div class="loading-fullscreen" v-if="loading">
        <div class="loading-box">
            <a-spin size="large"></a-spin>
            <a-progress
                :strokeWidth="16"
                :percent="percent"
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
import useImport from "@/hooks/useImport";
import { message } from "ant-design-vue";

const instance = inject<Ref<Editor>>("instance");
const storePath = inject<Ref<string>>("storePath");
const fileVisible = ref(false);
const loading = ref(false);
const percent = ref(0);
const inputMPPTXRef = ref();
const inputPPTXRef = ref();

const { outputMPPTX, outputPPTX, getMPPTXContent } = useExport(instance, loading, percent);
const { importMPPTX, importPPTX } = useImport(instance, loading, percent);

const handleDropdown = (e: MenuInfo) => {
    fileVisible.value = false;
    switch (e.key) {
        case "exportMPPTX": {
            outputMPPTX();
            break;
        }
        case "importMPPTX": {
            inputMPPTXRef.value.click();
            break;
        }
        case "exportPPTX": {
            outputPPTX();
            break;
        }
        case "importPPTX": {
            inputPPTXRef.value.click();
            break;
        }
    }
};

const inputMPPTXFileChange = (e: Event) => {
    if (!e.target) return;
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    importMPPTX(files[0]);
};

const inputPPTXFileChange = (e: Event) => {
    if (!e.target) return;
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    importPPTX(files[0]);
};

const onSave = async () => {
    if (storePath?.value) {
        const content = await getMPPTXContent();
        const isOK = window.electron.saveFile(storePath.value, content);
        if (isOK) {
            message.success("保存成功");
        } else {
            message.error("文件不存在了");
        }
    } else {
        await outputMPPTX();
    }
    // 清理历史记录 初始化历史记录
    await instance?.value.history.clear();
    instance?.value.history.getHistorySnapshot();
};

const onSaveAs = async () => {
    await outputMPPTX();
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

.ppt-input-file {
    position: fixed;
    left: -1000px;
}
</style>
