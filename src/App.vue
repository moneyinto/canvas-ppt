<template>
    <div class="ppt-container">
        <div class="ppt-toolbar">
            <NavMenu />
            <Tools />
        </div>
        <div class="ppt-body">
            <div class="ppt-thumbnail"></div>
            <div class="ppt-content" ref="pptRef"></div>
        </div>
        <div class="ppt-footer">
            <Footer :zoom="zoom" :instance="instance" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { nextTick, ref } from "vue";
import NavMenu from "./layout/NavMenu/index.vue";
import Tools from "./layout/Tools.vue";
import Footer from "./layout/Footer.vue";
import Editor from "./plugins/editor";

const pptRef = ref();
const zoom = ref(1);
const instance = ref<Editor>();

nextTick(() => {
    if (pptRef.value) {
        instance.value = new Editor(pptRef.value);
        zoom.value = instance.value.command.getZoom();
        instance.value.listener.onZoomChange = (newZoom) => {
            zoom.value = newZoom;
        };
    }
});
</script>

<style lang="scss" scoped>
.ppt-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: #eee;
}

.ppt-toolbar {
    height: 62px;
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
