<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="合并单元格">
            <div
                class="ppt-tool-btn"
                :class="mergeDisabled && 'disabled'"
                @click="setMergeCell()"
            >
                <SvgIcon name="mergeCell" :size="28" />
            </div>
        </a-tooltip>
        <a-tooltip title="拆分单元格">
            <div
                class="ppt-tool-btn"
                :class="splitDisabled && 'disabled'"
                @click="setSplitCell()"
            >
                <SvgIcon name="splitCell" :size="28" />
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { Ref, inject } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";
import Editor from "@/plugins/editor";

const instance = inject<Ref<Editor>>("instance");

const mergeDisabled = inject<Ref<boolean>>("mergeDisabled");
const splitDisabled = inject<Ref<boolean>>("splitDisabled");

const setMergeCell = () => {
    if (mergeDisabled?.value) return;
    instance?.value.command.executeMergeCell();
};

const setSplitCell = () => {
    if (splitDisabled?.value) return;
    instance?.value.command.executeSplitCell();
};
</script>
