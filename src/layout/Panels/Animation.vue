<template>
    <div class="ppt-background-panel">
        <div class="ppt-panel-header">
            <div class="ppt-panel-title">
                <PPTIcon icon="background" :size="32" />
                元素动画
            </div>
            <PPTIcon
                class="ppt-close-btn"
                @click="closePanel()"
                icon="close"
                :size="18"
            />
        </div>
        <div class="ppt-panel-content">
            动画
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject, Ref, watch } from "vue";
import PPTIcon from "@/components/Icon.vue";
import Editor from "@/plugins/editor";
import emitter, { EmitterEvents } from "@/utils/emitter";

const instance = inject<Ref<Editor>>("instance");

const init = async () => {
    if (instance?.value) {
        //
    }
};

init();

watch(instance!, init);

const closePanel = () => {
    emitter.emit(EmitterEvents.SHOW_PANELS, false);
    setTimeout(() => {
        emitter.emit(EmitterEvents.PANELS_TYPE, "");
    }, 300);
};
</script>

<style lang="scss" scoped>
.ppt-background-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    .ppt-panel-header {
        height: 44px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        justify-content: space-between;
        border-bottom: 1px solid rgba(65, 70, 75, 0.1);
    }

    .ppt-panel-title {
        display: flex;
        align-items: center;
    }

    .ppt-close-btn {
        cursor: pointer;
    }

    .ppt-panel-content {
        padding: 10px 15px;
        flex: 1;
    }
}
</style>
