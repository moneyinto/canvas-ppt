<template>
    <div class="ppt-nav-menu" @keydown.stop="" tabindex="0">
        <Edit :elements="elements" :slideFocus="slideFocus" />
    </div>
</template>

<script lang="ts" setup>
import { IPPTElement } from "@/types/element";
import { PropType, toRefs } from "vue";
import Edit from "./Edit.vue";
const props = defineProps({
    slideFocus: {
        type: Boolean,
        default: false
    },
    elements: {
        type: Object as PropType<IPPTElement[]>,
        required: true
    }
});

const { slideFocus, elements } = toRefs(props);
</script>

<style lang="scss">
.ppt-nav-menu {
    height: 26px;
    font-size: 12px;
    background-color: rgb(247, 247, 247);
    border-bottom: 1px solid rgba(65, 70, 75, 0.1);
    user-select: none;
    display: flex;
    align-items: center;
    padding: 0 10px;
    outline: 0;
    .ppt-menu-item {
        padding: 1px 15px 0;
        height: 25px;
        display: flex;
        align-items: center;
        cursor: pointer;
        &:hover {
            background-color: #efefef;
        }
    }
}

.ppt-menu-option {
    display: flex;
    align-items: center;
    font-size: 12px;
    width: 140px;
    .disabled {
        opacity: 0.3;
    }
}
</style>
