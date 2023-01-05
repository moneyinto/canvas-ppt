<template>
    <a-dropdown placement="bottomLeft" trigger="click">
        <div class="ppt-menu-item">编辑</div>
        <template #overlay>
            <a-menu>
                <a-menu-item>
                    <div class="ppt-menu-option">
                        <PPTIcon icon="undo" /> &nbsp;&nbsp;撤销
                    </div>
                </a-menu-item>
                <a-menu-item>
                    <div class="ppt-menu-option">
                        <PPTIcon icon="redo" /> &nbsp;&nbsp;重做
                    </div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item>
                    <div class="ppt-menu-option">
                        <PPTIcon icon="cut" /> &nbsp;&nbsp;剪切
                    </div>
                </a-menu-item>
                <a-menu-item>
                    <div class="ppt-menu-option">
                        <PPTIcon icon="copy" /> &nbsp;&nbsp;复制
                    </div>
                </a-menu-item>
                <a-menu-item>
                    <div class="ppt-menu-option">
                        <PPTIcon icon="paste" /> &nbsp;&nbsp;粘贴
                    </div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item>
                    <div class="ppt-menu-option">
                        <PPTIcon icon="all" /> &nbsp;&nbsp;全选
                    </div>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>
