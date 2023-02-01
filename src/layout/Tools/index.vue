<template>
    <div class="ppt-tools">
        <AddPPT />

        <a-divider class="ppt-tool-divider" type="vertical" />
        <Edit />

        <a-divider class="ppt-tool-divider" type="vertical" />
        <Insert />

        <a-divider class="ppt-tool-divider" v-if="showEvert" type="vertical" />
        <Evert v-if="showEvert" :element="currentElement" />

        <a-divider class="ppt-tool-divider" v-if="showFillColor" type="vertical" />
        <FillColor v-if="showFillColor" :element="currentElement" />
    </div>
</template>

<script lang="ts" setup>
import { inject, Ref, ref, watch } from "vue";
import AddPPT from "./AddPPT.vue";
import Edit from "./Edit.vue";
import Insert from "./Insert.vue";
import FillColor from "./FillColor.vue";
import Editor from "@/plugins/editor";
import { IPPTElement } from "@/plugins/types/element";
import Evert from "./Evert.vue";

const instance = inject<Ref<Editor>>("instance");
const currentElement = ref<IPPTElement | null>(null);

watch(instance!, () => {
    if (instance?.value) {
        instance.value.listener.onSelectedChange = (element: IPPTElement | null) => {
            currentElement.value = element;
            if (element) {
                showFillColor.value = element.type === "shape";
                showEvert.value = element.type === "shape";
            } else {
                showFillColor.value = false;
            }
        };
    }
});

const showFillColor = ref(false);
const showEvert = ref(false);
</script>

<style lang="scss" scoped>
.ppt-tools {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: rgb(85, 85, 85);
    background: rgb(247, 247, 247);
    user-select: none;
    height: 36px;
    border-bottom: 1px solid rgba(65, 70, 75, 0.1);
    padding: 0px 10px;
}

.ppt-tool-divider {
    border-left-color: #d9dadb;
    top: 0;
    height: 18px;
}
</style>

<style lang="scss">
.ppt-edit-tools {
    height: 28px;
    display: flex;
    align-items: center;
}

.ppt-tool-btn {
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    font-size: 12px;
    height: 28px;
    cursor: pointer;
    padding: 0 2px;
    &:hover {
        border-color: #ccc;
        // background-color: #ececec;
    }
    &.disabled {
        opacity: .3;
        border-color: transparent;
        cursor: not-allowed;
    }
}

.ppt-tool-multifunction {
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    font-size: 12px;
    height: 28px;
    cursor: pointer;
    .ppt-tool-block {
        padding-left: 5px;
        display: flex;
        align-items: center;
        height: 26px;
        &:hover {
            background-color: #ececec;
        }
    }
    &:hover {
        border-color: #ccc;
        .ppt-tool-dropdown {
            border-color: #ccc;
        }
    }
    .ppt-tool-text {
        margin-top: 1px;
        margin-left: 2px;
        margin-right: 5px;
    }
    .ppt-tool-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        border-left: 1px solid transparent;
        background-color: rgb(247, 247, 247);
        width: 16px;
        height: 26px;
        &:hover {
            background-color: #ececec;
        }
    }
}
</style>
