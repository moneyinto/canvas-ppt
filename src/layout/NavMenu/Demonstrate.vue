<template>
    <a-dropdown
        v-model:visible="demonstrateVisible"
        overlayClassName="ppt-arrangement-menu"
        placement="bottomLeft"
        trigger="click"
    >
        <div class="ppt-menu-item">演示</div>
        <template #overlay>
            <a-menu triggerSubMenuAction="click">
                <a-menu-item>
                    <div class="ppt-menu-option" @click="preview(0)">
                        <SvgIcon name="demonstrate" :size="28" />
                        &nbsp;&nbsp;从头演示
                    </div>
                </a-menu-item>
                <a-menu-item>
                    <div class="ppt-menu-option" @click="preview(current)">
                        &nbsp;<SvgIcon name="preview" :size="22" />
                        &nbsp;&nbsp;&nbsp;从当前页演示
                    </div>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";

defineProps({
    current: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(["onPreview"]);

const demonstrateVisible = ref(false);

const preview = (slideIndex: number) => {
    demonstrateVisible.value = false;
    emit("onPreview", slideIndex);
};
</script>
