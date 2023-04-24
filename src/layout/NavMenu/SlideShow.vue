<template>
    <a-dropdown
        v-model:visible="slideShowVisible"
        overlayClassName="ppt-arrangement-menu"
        placement="bottomLeft"
        trigger="click"
    >
        <div class="ppt-menu-item">幻灯片</div>
        <template #overlay>
            <a-menu triggerSubMenuAction="click">
                <a-menu-item>
                    <div class="ppt-menu-option" @click="addSlide()">
                        <div style="width: 28px; height: 26px"></div>
                        &nbsp;&nbsp;新建页面
                    </div>
                </a-menu-item>
                <a-menu-item>
                    <div class="ppt-menu-option" @click="copySlide()">
                        <div style="width: 28px; height: 26px"></div>
                        &nbsp;&nbsp;复制页面
                    </div>
                </a-menu-item>
                <a-menu-item>
                    <div class="ppt-menu-option" @click="deleteSlide()">
                        <div style="width: 28px; height: 26px"></div>
                        &nbsp;&nbsp;删除页面
                    </div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item>
                    <div class="ppt-menu-option" @click="setBackground()">
                        <PPTIcon icon="background" :size="28" />
                        &nbsp;&nbsp;背景设置
                    </div>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script lang="ts" setup>
import emitter, { EmitterEvents } from "@/utils/emitter";
import { PANELS } from "@/utils/panel";
import { ref } from "vue";
import PPTIcon from "@/components/Icon.vue";

const slideShowVisible = ref(false);

const addSlide = () => {
    slideShowVisible.value = false;
    emitter.emit(EmitterEvents.ADD_EMPTY_SLIDE);
};

const copySlide = () => {
    slideShowVisible.value = false;
    emitter.emit(EmitterEvents.COPY_SLIDE);
};

const deleteSlide = () => {
    slideShowVisible.value = false;
    emitter.emit(EmitterEvents.DELETE_SLIDE);
};

const setBackground = () => {
    slideShowVisible.value = false;
    emitter.emit(EmitterEvents.SHOW_PANELS, true);
    emitter.emit(EmitterEvents.PANELS_TYPE, PANELS.BACKGROUND);
};
</script>
