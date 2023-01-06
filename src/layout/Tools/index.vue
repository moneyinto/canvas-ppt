<template>
    <div class="ppt-tools">
        <AddPPT />
        <a-divider class="ppt-tool-divider" type="vertical" />
        <Edit />
        <a-divider class="ppt-tool-divider" type="vertical" />
        <Insert />
    </div>
</template>

<script lang="ts" setup>
import AddPPT from "./AddPPT.vue";
import Edit from "./Edit.vue";
import Insert from "./Insert.vue";
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
</style>
