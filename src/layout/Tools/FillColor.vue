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
                            v-if="showFillColor"
                            :elements="elements"
                            v-model:cacheFillColor="cacheFillColor"
                            v-model:showFillColor="showFillColor"
                        />
                    </template>
                </a-popover>
            </div>
        </a-tooltip>

        <a-tooltip
            title="主题颜色"
            v-if="isTableEdit"
            :visible="!showThemeColor && hoverThemeColor"
        >
            <div
                class="ppt-tool-multifunction"
                @mouseover="hoverThemeColor = true"
                @mouseleave="hoverThemeColor = false"
            >
                <a-popover trigger="click" v-model:visible="showThemeColor">
                    <div
                        class="ppt-tool-block"
                        style="padding: 0 5px"
                        @click="showThemeColor = !showThemeColor"
                    >
                        <PPTIcon icon="platte" :size="16" />
                    </div>
                    <template #content>
                        <ColorBoard
                            :color="currentThemeColor"
                            @change="onChangeThemeColor"
                        />
                        <a-divider style="margin: 12px 0" />
                        <div class="ppt-tool-line">
                            <div class="tool-line-title">标题行</div>
                            <div class="tool-line-box">
                                <a-switch
                                    v-model:checked="rowHeaderChecked"
                                    size="small"
                                    @change="onChangeRowHeader"
                                />
                            </div>
                        </div>
                    </template>
                </a-popover>
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { THEME_COLOR } from "@/plugins/config/stage";
import { inject, PropType, Ref, ref, watch } from "vue";
import FillPool from "@/components/FillPool.vue";
import PPTIcon from "@/components/Icon.vue";
import { IPPTElement, IPPTTableElement } from "@/types/element";
import { STORAGE_FILL_COLOR } from "@/utils/storage";
import Editor from "@/plugins/editor";
import ColorBoard from "@/components/ColorBoard.vue";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const instance = inject<Ref<Editor>>("instance");

const cacheFillColor = ref(
    localStorage.getItem(STORAGE_FILL_COLOR) || THEME_COLOR
);

const isTableEdit = ref(false);
const currentThemeColor = ref(THEME_COLOR);
const rowHeaderChecked = ref(false);

const init = () => {
    isTableEdit.value = props.elements.some((item) => item.type === "table");
    const operateElements = props.elements.filter(
        (element) => element.type === "table"
    );

    for (const [index, operateElement] of operateElements.entries()) {
        const element = operateElement as IPPTTableElement;
        if (index === 0) {
            if (element.theme) {
                currentThemeColor.value = element.theme.color;
                rowHeaderChecked.value = element.theme.rowHeader;
            }
        } else {
            if (
                element.theme &&
                element.theme.color !== currentThemeColor.value
            ) {
                currentThemeColor.value = THEME_COLOR;
            }
            if (
                element.theme &&
                element.theme.rowHeader !== rowHeaderChecked.value
            ) {
                rowHeaderChecked.value = false;
            }
        }
    }
};

init();

watch(() => props.elements, init);

const showFillColor = ref(false);
const hoverFillColor = ref(false);

const showThemeColor = ref(false);
const hoverThemeColor = ref(false);

const setFillColor = (color?: string, noClose?: boolean) => {
    instance?.value.command.executeFill({ color });
    if (!noClose) showFillColor.value = false;
};

const onChangeThemeColor = (
    args: Parameters<(color: string, noClose?: boolean) => void>
) => {
    currentThemeColor.value = args[0];
    instance?.value.command.executeSetTableTheme({
        color: args[0]
    });
    if (!args[1]) showThemeColor.value = false;
};

const onChangeRowHeader = (checked: boolean) => {
    rowHeaderChecked.value = checked;
    instance?.value.command.executeSetTableTheme({
        rowHeader: checked
    });
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

.ppt-tool-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tool-line-title {
        color: #919397;
        font-size: 12px;
    }
}
</style>
