<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="填充颜色" :visible="!showFillColor && hoverFillColor">
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverFillColor = true"
                @mouseleave="hoverFillColor = false"
            >
                <div
                    class="ppt-tool-block"
                    @click="setFillColor(cacheFillColor)"
                >
                    <PPTIcon icon="fillColor" :size="26" />
                    <div
                        class="fill-color-line"
                        :style="{ background: cacheFillColor }"
                    ></div>
                </div>

                <a-popover trigger="click" v-model:visible="showFillColor">
                    <div
                        class="ppt-tool-dropdown"
                        @click="showFillColor = !showFillColor"
                    >
                        <PPTIcon icon="down" :size="6" />
                    </div>

                    <template #content>
                        <FillPool
                            :elements="elements"
                            v-model:cacheFillColor="cacheFillColor"
                            v-model:showFillColor="showFillColor"
                        />
                    </template>
                </a-popover>
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { THEME_COLOR } from "@/plugins/config/stage";
import { inject, PropType, Ref, ref, toRefs } from "vue";
import FillPool from "@/components/FillPool.vue";
import PPTIcon from "@/components/Icon.vue";
import {
    IPPTElement
} from "@/types/element";
import { STORAGE_FILL_COLOR } from "@/utils/storage";
import Editor from "@/plugins/editor";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const { elements } = toRefs(props);

const instance = inject<Ref<Editor>>("instance");

const cacheFillColor = ref(
    localStorage.getItem(STORAGE_FILL_COLOR) || THEME_COLOR
);

const showFillColor = ref(false);
const hoverFillColor = ref(false);

const setFillColor = (color?: string, noClose?: boolean) => {
    instance?.value.command.executeFill({ color });
    if (!noClose) showFillColor.value = false;
};
</script>

<style lang="scss" scoped>
.ppt-tool-multifunction {
    .ppt-tool-block {
        padding: 0 2px;
        position: relative;
        .fill-color-line {
            position: absolute;
            width: 12px;
            height: 3.5px;
            bottom: 4px;
            left: 9px;
        }
    }
}
</style>
