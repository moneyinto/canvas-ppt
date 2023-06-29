<template>
    <a-tooltip title="切页动画">
        <div class="ppt-tool-btn" @click="setPageSwitchAnimation()">
            <SvgIcon name="pageSwitch" :size="28" />
        </div>
    </a-tooltip>
    <a-tooltip title="元素动画">
        <div class="ppt-tool-btn" @click="setElementsAnimation()">
            <SvgIcon name="animation" :size="28" />
        </div>
    </a-tooltip>
</template>

<script lang="ts" setup>
import emitter, { EmitterEvents } from "@/utils/emitter";
import { PANELS } from "@/utils/panel";
import SvgIcon from "@/components/SvgIcon.vue";

const setPageSwitchAnimation = () => {
    emitter.emit(EmitterEvents.SHOW_PANELS, true);
    emitter.emit(EmitterEvents.PANELS_TYPE, PANELS.PAGE_SWITCH);
};

const setElementsAnimation = () => {
    emitter.emit(EmitterEvents.SHOW_PANELS, true);
    emitter.emit(EmitterEvents.PANELS_TYPE, PANELS.ANIMATION);
};
</script>
