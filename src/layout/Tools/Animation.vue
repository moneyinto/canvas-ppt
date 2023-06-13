<template>
    <a-tooltip title="元素动画">
        <div class="ppt-tool-btn" @click="setBackground()">
            <SvgIcon name="animation" :size="28" />
        </div>
    </a-tooltip>
</template>

<script lang="ts" setup>
import emitter, { EmitterEvents } from "@/utils/emitter";
import { PANELS } from "@/utils/panel";
import SvgIcon from "@/components/SvgIcon.vue";

const setBackground = () => {
    emitter.emit(EmitterEvents.SHOW_PANELS, true);
    emitter.emit(EmitterEvents.PANELS_TYPE, PANELS.ANIMATION);
};
</script>
