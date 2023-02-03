<template>
    <div class="ppt-tool-multifunction">
        <div class="ppt-tool-block" @click="addPPT()">
            <PPTIcon icon="add" />
            <div class="ppt-tool-text">新建幻灯片</div>
        </div>
        <div class="ppt-tool-dropdown">
            <PPTIcon icon="down" :size="6" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import emitter, { EmitterEvents } from "@/utils/emitter";

const addPPT = () => {
    emitter.emit(EmitterEvents.ADD_EMPTY_SLIDE);
};
</script>
