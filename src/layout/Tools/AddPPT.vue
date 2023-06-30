<template>
    <div class="ppt-tool-multifunction">
        <div class="ppt-tool-block" @click="addPPT()">
            <SvgIcon name="add" />
            <div class="ppt-tool-text">新建幻灯片</div>
        </div>
        <div class="ppt-tool-dropdown">
            <SvgIcon name="down" :size="6" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import SvgIcon from "@/components/SvgIcon.vue";
import emitter, { EmitterEvents } from "@/utils/emitter";

const addPPT = () => {
    emitter.emit(EmitterEvents.ADD_EMPTY_SLIDE);
};
</script>

<style lang="scss" scoped>
.ppt-tool-multifunction {
    min-width: 120px;
}
</style>
