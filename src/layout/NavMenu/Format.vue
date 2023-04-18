<template>
    <a-dropdown
        v-model:visible="formatVisible"
        overlayClassName="ppt-format-menu"
        placement="bottomLeft"
        trigger="click"
    >
        <div class="ppt-menu-item">格式</div>
        <template #overlay>
            <a-menu triggerSubMenuAction="click">
                <a-sub-menu :disabled="fontDisabled" key="sub-text">
                    <template #title>
                        <div class="ppt-menu-option">
                            <div style="width: 28px; height: 26px"></div>
                            &nbsp;&nbsp;文字
                        </div>
                    </template>
                    <a-menu-item>
                        <div class="ppt-menu-option">
                            <PPTIcon icon="boldFont" :size="28" />
                            &nbsp;&nbsp;加粗
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option">
                            <PPTIcon icon="italicFont" :size="28" />
                            &nbsp;&nbsp;斜体
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option">
                            <PPTIcon icon="underline" :size="28" />
                            &nbsp;&nbsp;下划线
                        </div>
                    </a-menu-item>
                    <a-menu-item>
                        <div class="ppt-menu-option">
                            <PPTIcon icon="strikout" :size="28" />
                            &nbsp;&nbsp;中划线
                        </div>
                    </a-menu-item>
                    <a-divider class="ppt-menu-divider"></a-divider>
                    <a-sub-menu key="sub-font">
                        <template #title>
                            <div class="ppt-menu-option">
                                <div style="width: 28px; height: 26px"></div>
                                &nbsp;&nbsp;字体
                            </div>
                        </template>
                        <a-menu-item
                            v-for="font in availableFonts"
                            :key="font.value"
                        >
                            <div
                                class="ppt-menu-option ppt-menu-checked"
                                @click="setFontFamily(font.value)"
                            >
                                {{ font.label }}

                                <PPTIcon
                                    class="font-family-checked"
                                    :class="
                                        fontFamily == font.value && 'active'
                                    "
                                    icon="checked"
                                    :size="28"
                                />
                            </div>
                        </a-menu-item>
                    </a-sub-menu>
                    <a-sub-menu key="sub-font-size">
                        <template #title>
                            <div class="ppt-menu-option">
                                <div style="width: 28px; height: 26px"></div>
                                &nbsp;&nbsp;字号
                            </div>
                        </template>
                        <a-menu-item v-for="size in sizes" :key="size">
                            <div class="ppt-menu-option">
                                {{ size }}
                            </div>
                        </a-menu-item>
                    </a-sub-menu>
                </a-sub-menu>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script lang="ts" setup>
import { computed, inject, PropType, ref, Ref, watch } from "vue";
import Editor from "@/plugins/editor";
import PPTIcon from "@/components/Icon.vue";
import useFontFamilyHandler from "@/hooks/useFontFamilyHandler";
import { IPPTElement } from "@/types/element";

const props = defineProps({
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const elements = computed(() => props.elements);

const sizes = ref([
    8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 66, 72
]);

const formatVisible = ref(false);
const instance = inject<Ref<Editor>>("instance");

const fontDisabled = ref(true);
const { availableFonts, fontFamily } = useFontFamilyHandler(elements);
const setFontFamily = (font: string) => {
    formatVisible.value = false;
    fontFamily.value = font;
    instance?.value.command.executeSetFontFamily(font);
};

watch(elements, () => {
    if (elements.value.length > 0) {
        fontDisabled.value = elements.value.filter(element => element.type === "text").length === 0;
    } else {
        fontDisabled.value = true;
    }
});
</script>

<style lang="scss">
.ant-dropdown-menu-item-disabled .ppt-icon {
    opacity: 0.4;
}

.ppt-menu-checked {
    justify-content: space-between;
}

.ppt-format-menu {
    .ant-dropdown-menu-submenu-expand-icon {
        top: 6px;
    }

    .ppt-menu-divider {
        margin: 4px 0;
    }

    .font-family-checked {
        visibility: hidden;
        &.active {
            visibility: visible;
        }
    }
}
</style>
