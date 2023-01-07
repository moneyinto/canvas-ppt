<template>
    <div class="ppt-edit-tools">
        <div
            class="ppt-tool-btn"
            :class="!canUndo && 'disabled'"
            @click="undo()"
        >
            <PPTIcon icon="undo" :size="28" />
        </div>

        <div
            class="ppt-tool-btn"
            :class="!canRedo && 'disabled'"
            @click="redo()"
        >
            <PPTIcon icon="redo" :size="28" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import Editor from "@/plugins/editor";
import { throttle } from "lodash";
import { computed, inject, ref, Ref, watch } from "vue";

const instance = inject<Ref<Editor>>("instance");

const historyCursor = ref(0);
const historyLength = ref(0);
const canRedo = computed(() => historyCursor.value < historyLength.value - 1);
const canUndo = computed(() => historyCursor.value > 0);

watch(instance!, () => {
    if (instance?.value) {
        instance.value.listener.onEditChange = (cursor, length) => {
            historyCursor.value = cursor;
            historyLength.value = length;
        };
    }
});

const undo = throttle(() => {
    if (canUndo.value) instance?.value.history.undo();
}, 100);

const redo = throttle(() => {
    if (canRedo.value) instance?.value.history.redo();
}, 100);
</script>
