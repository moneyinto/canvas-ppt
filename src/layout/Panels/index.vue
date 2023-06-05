<template>
    <div class="ppt-panel" :class="visible && 'active'">
        <component :is="PanelComponent"></component>
    </div>
</template>

<script lang="ts" setup>
import { PANELS } from "@/utils/panel";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { computed, onMounted, onUnmounted, ref } from "vue";
import Background from "./Background.vue";

defineProps({
    visible: {
        type: Boolean,
        required: true
    }
});

const panel = ref<PANELS | "">("");

const PanelComponent = computed(() => {
    const PanelMap: any = {
        [PANELS.BACKGROUND]: Background
    };

    return panel.value ? PanelMap[panel.value] : null;
});

const showPanelType = (type: PANELS | "") => {
    panel.value = type;
};

onMounted(() => {
    emitter.on(EmitterEvents.PANELS_TYPE, showPanelType);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.PANELS_TYPE, showPanelType);
});
</script>

<style lang="scss" scoped>
.ppt-panel {
    background: rgb(250, 250, 250);
    box-shadow: rgb(0 0 0 / 10%) -1px 0px 2px;
    transition: all .3s;
    height: 100%;
    position: absolute;
    left: 100%;
    width: 284px;
    &.active {
        left: 0;
    }
}
</style>
