<template>
    <div class="ppt-container">
        <div class="ppt-toolbar"></div>
        <div class="ppt-body">
            <div class="ppt-thumbnail"></div>
            <div class="ppt-content" ref="pptRef"></div>
        </div>
        <div class="ppt-footer">
            <Footer :zoom="zoom" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { nextTick, ref } from "vue";
import Footer from "./layout/Footer.vue";
import Editor from "./plugins/editor";

const pptRef = ref();
const zoom = ref(1);
const instance = ref<Editor>();

nextTick(() => {
    if (pptRef.value) {
        instance.value = new Editor(pptRef.value);
        console.log("初始化实例", instance.value.command.getZoom());
        zoom.value = Number(instance.value.command.getZoom().toFixed(2));
        instance.value.listener.onZoomChange = (newZoom) => {
            zoom.value = Number(newZoom.toFixed(2));
            console.log("缩放比例", newZoom);
        };
    }
});
</script>

<style lang="scss" scoped>
.ppt-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: #eee;
}

.ppt-toolbar {
    height: 62px;
    border-bottom: 1px solid rgba(65, 70, 75, 0.1);
    background-color: #f7f7f7;
}

.ppt-body {
    flex: 1;
    min-height: 0;
    display: flex;
    .ppt-thumbnail {
        width: 200px;
        border-right: 1px solid #d1d1d1;
        background-color: #fafafa;
    }
    .ppt-content {
        flex: 1;
        min-width: 0;
        position: relative;
    }
}

.ppt-footer {
    height: 32px;
    background-color: #e9e9e9;
    border-top: 1px solid rgba(65, 70, 75, 0.1);
}
</style>
