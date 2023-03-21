<template>
    <a-dropdown placement="bottomLeft" trigger="click">
        <div class="ppt-menu-item">编辑</div>
        <template #overlay>
            <a-menu>
                <a-menu-item :disabled="!canUndo" @click="undo()">
                    <div class="ppt-menu-option">
                        <PPTIcon :class="!canUndo && 'disabled'" icon="undo" />
                        &nbsp;&nbsp;撤销
                    </div>
                </a-menu-item>
                <a-menu-item :disabled="!canRedo" @click="redo()">
                    <div class="ppt-menu-option">
                        <PPTIcon :class="!canRedo && 'disabled'" icon="redo" />
                        &nbsp;&nbsp;重做
                    </div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item :disabled="disabledCut" @click="cut()">
                    <div class="ppt-menu-option">
                        <PPTIcon icon="cut" />
                        &nbsp;&nbsp;剪切
                    </div>
                </a-menu-item>
                <a-menu-item :disabled="disabledCut" @click="copy()">
                    <div class="ppt-menu-option">
                        <PPTIcon icon="copy" />
                        &nbsp;&nbsp;复制
                    </div>
                </a-menu-item>
                <a-menu-item @click="paste()">
                    <div class="ppt-menu-option">
                        <PPTIcon icon="paste" />
                        &nbsp;&nbsp;粘贴
                    </div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item>
                    <div class="ppt-menu-option">
                        <PPTIcon icon="all" />
                        &nbsp;&nbsp;全选
                    </div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item>
                    <div class="ppt-menu-option" @click="onSave">
                        <PPTIcon style="margin: 0 5px" icon="save" :size="14" />
                        &nbsp;&nbsp;保存
                    </div>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script lang="ts" setup>
import Editor from "@/plugins/editor";
import { inject, Ref, computed, toRefs, PropType } from "vue";
import { throttleRAF } from "@/utils";
import { IPPTElement } from "@/types/element";
import emitter, { EmitterEvents } from "@/utils/emitter";

const props = defineProps({
    slideFocus: {
        type: Boolean,
        default: false
    },
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const { slideFocus, elements } = toRefs(props);

const disabledCut = computed(() => {
    return !slideFocus.value && elements.value.length === 0;
});

const instance = inject<Ref<Editor>>("instance");

const cut = () => {
    if (slideFocus.value) {
        emitter.emit(EmitterEvents.CUT_SLIDE);
    } else if (elements.value.length > 0) {
        instance?.value.command.executeCut();
    }
};

const copy = () => {
    if (slideFocus.value) {
        emitter.emit(EmitterEvents.COPY_SLIDE);
    } else if (elements.value.length > 0) {
        instance?.value.command.executeCopy();
    }
};

const paste = () => {
    if (slideFocus.value) {
        emitter.emit(EmitterEvents.PASTE_SLIDE);
    } else {
        instance?.value.command.executePaste();
    }
};

const onSave = async () => {
    console.log(JSON.stringify(instance?.value.stageConfig.slides));
    // 清理历史记录 初始化历史记录
    await instance?.value.history.clear();
    instance?.value.history.getHistorySnapshot();
};

const historyCursor = inject<Ref<number>>("historyCursor");
const historyLength = inject<Ref<number>>("historyLength");

const canRedo = computed(() => historyCursor!.value < historyLength!.value - 1);
const canUndo = computed(() => historyCursor!.value > 0);

const undo = throttleRAF(() => {
    if (canUndo.value) instance?.value.history.undo();
});

const redo = throttleRAF(() => {
    if (canRedo.value) instance?.value.history.redo();
});
</script>

<style>
.ant-dropdown-menu-item-disabled .ppt-icon {
    opacity: 0.4;
}
</style>
