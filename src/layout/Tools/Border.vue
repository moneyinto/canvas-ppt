<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="线条颜色" :visible="!showBorder && hoverBorder">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverBorder = true"
                @mouseleave="hoverBorder = false"
            >
                <div
                    class="ppt-tool-block"
                    @click="setBorderColor(cacheBorderColor)"
                >
                    <PPTIcon icon="borderColor" :size="26" />
                    <div
                        class="border-color-line"
                        :style="{ background: cacheBorderColor }"
                    ></div>
                </div>

                <a-popover trigger="click" v-model:visible="showBorder">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showBorder = !showBorder"
                    >
                        <PPTIcon icon="down" :size="6" />
                    </div>

                    <template #content>
                        <BorderPool
                            :elements="elements"
                            v-model:cacheBorderColor="cacheBorderColor"
                            v-model:showBorder="showBorder"
                        />
                    </template>
                </a-popover>
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { THEME_COLOR } from "@/plugins/config/stage";
import { inject, PropType, Ref, ref } from "vue";
import PPTIcon from "@/components/Icon.vue";
import { IPPTElement } from "@/types/element";
import { STORAGE_BORDER_COLOR } from "@/utils/storage";
import Editor from "@/plugins/editor";
import BorderPool from "@/components/BorderPool.vue";

const instance = inject<Ref<Editor>>("instance");

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const cacheBorderColor = ref(
    localStorage.getItem(STORAGE_BORDER_COLOR) || THEME_COLOR
);

const showBorder = ref(false);
const hoverBorder = ref(false);

const setBorderColor = (color?: string, noClose?: boolean) => {
    if (props.elements.length > 0) {
        instance?.value.command.executeOutline({
            color
        });
    }
    if (!noClose) showBorder.value = false;
};
</script>

<style lang="scss" scoped>
.ppt-tool-multifunction {
    .ppt-tool-block {
        padding: 0 2px;
        position: relative;
        .border-color-line {
            position: absolute;
            width: 12px;
            height: 3.5px;
            bottom: 4px;
            left: 9px;
        }
    }
}
</style>

<style lang="scss">
.ppt-sub-menu {
    height: 30px !important;
    line-height: 30px !important;
    margin: 0 !important;
    background-color: #ffffff !important;
    &:hover {
        background-color: #41464b0d !important;
    }
    .ant-menu-title-content {
        display: flex;
        align-items: center;
        height: 30px;
        .ppt-border-dashed {
            border-top: 2px dashed #555555;
            flex: 1;
        }

        .ppt-border-solid {
            border-top: 2px solid #555555;
            flex: 1;
        }
    }

    .border-checked {
        margin-left: 10px;
        visibility: hidden;
        &.active {
            visibility: visible;
        }
    }
}

.ant-menu-submenu-placement-rightTop .ant-menu-vertical {
    padding: 10px 0 !important;
}
</style>
