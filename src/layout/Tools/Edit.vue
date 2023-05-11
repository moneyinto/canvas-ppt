<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="撤销">
            <div
                class="ppt-tool-btn"
                :class="!canUndo && 'disabled'"
                @click="undo()"
            >
                <PPTIcon icon="undo" :size="28" />
            </div>
        </a-tooltip>

        <a-tooltip title="恢复">
            <div
                class="ppt-tool-btn"
                :class="!canRedo && 'disabled'"
                @click="redo()"
            >
                <PPTIcon icon="redo" :size="28" />
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import Editor from "@/plugins/editor";
import { computed, inject, Ref } from "vue";
import { throttleRAF } from "@/utils";
import PPTIcon from "@/components/Icon.vue";

const historyCursor = inject<Ref<number>>("historyCursor");
const historyLength = inject<Ref<number>>("historyLength");

const instance = inject<Ref<Editor>>("instance");

const canRedo = computed(() => historyCursor!.value < historyLength!.value - 1);
const canUndo = computed(() => historyCursor!.value > 0);

const undo = throttleRAF(() => {
    if (canUndo.value) instance?.value.history.undo();
});

const redo = throttleRAF(() => {
    if (canRedo.value) instance?.value.history.redo();
});
</script>
