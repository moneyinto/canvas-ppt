<template>
    <div class="footer-container">
        <div class="ppt-zoom-control">
            <a-tooltip title="适合页面">
                <a-button class="ppt-zoom-btn" type="text" @click="fitZoom()"><PPTIcon icon="fit" :size="20" /></a-button>
            </a-tooltip>
            <a-tooltip :title="'缩小  ' + SHORTCUT.DECREASE">
                <a-button class="ppt-zoom-btn" type="text" @click="decrease()"><PPTIcon icon="minus" :size="20" /></a-button>
            </a-tooltip>
            <div class="ppt-zoom-view">
                {{ zoom }}%
            </div>
            <a-tooltip placement="topRight" :title="'放大  ' + SHORTCUT.INCREASE">
                <a-button class="ppt-zoom-btn" type="text" @click="increase()"><PPTIcon icon="plus" :size="20" /></a-button>
            </a-tooltip>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, inject, Ref, watch } from "vue";
import { SHORTCUT } from "@/plugins/config/shortcut";
import Editor from "@/plugins/editor";

const instance = inject<Ref<Editor>>("instance");

const zoom = ref(100);

watch(instance!, () => {
    if (instance?.value) {
        zoom.value = Math.floor(instance.value.command.getZoom() * 100);

        instance.value.listener.onZoomChange = (newZoom) => {
            zoom.value = Math.floor(newZoom * 100);
        };
    }
});

const fitZoom = () => {
    instance?.value.command.executeFitZoom();
};

const decrease = () => {
    instance?.value.command.executeDecrease();
};

const increase = () => {
    instance?.value.command.executeIncrease();
};
</script>

<style lang="scss" scoped>
.footer-container {
    display: flex;
    justify-content: flex-end;
}

.ppt-zoom-control {
    padding: 0 10px 0 30px;
    display: flex;
    align-items: center;
}

.ppt-zoom-btn {
    display: flex;
    align-items: center;
    padding: 4px 5px;
}

.ppt-zoom-view {
    font-size: 13px;
    margin: 0 8px;
}
</style>
