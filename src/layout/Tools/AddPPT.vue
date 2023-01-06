<template>
    <div class="ppt-add">
        <div class="ppt-add-block">
            <PPTIcon icon="add" />
            <div class="ppt-add-text">新建幻灯片</div>
        </div>
        <div class="ppt-add-dropdown">
            <PPTIcon icon="down" :size="6" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.ppt-add {
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    font-size: 12px;
    height: 28px;
    cursor: pointer;
    .ppt-add-block {
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
        .ppt-add-dropdown {
            border-color: #ccc;
        }
    }
    .ppt-add-text {
        margin-top: 1px;
        margin-left: 2px;
        margin-right: 5px;
    }
    .ppt-add-dropdown {
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
