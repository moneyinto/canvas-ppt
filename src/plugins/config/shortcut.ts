export const SHORTCUT = {
    INCREASE: "[⌃ or ⌘] + [+]",
    DECREASE: "[⌃ or ⌘] + [-]"
};

export const HOTKEY_DOC = [
    {
        title: "通用",
        children: [
            { label: "剪切", value: "Ctrl + X" },
            { label: "复制", value: "Ctrl + C" },
            { label: "粘贴", value: "Ctrl + V" },
            { label: "全选", value: "Ctrl + A" },
            { label: "撤销", value: "Ctrl + Z" },
            { label: "恢复", value: "Ctrl + Y" },
            { label: "删除", value: "Delete / Backspace" },
            { label: "多选", value: "按住Ctrl或Shift点击" }
        ]
    },
    {
        title: "幻灯片编辑",
        children: [
            { label: "缩放画布", value: "Ctrl + 鼠标滚轮" },
            { label: "放大画布", value: "Ctrl + =" },
            { label: "缩小画布", value: "Ctrl + -" },
            { label: "移动画布", value: "Space + 鼠标拖拽" },
            { label: "上一页（缩略图列表聚焦）", value: "↑" },
            { label: "下一页（缩略图列表聚焦）", value: "↓" }
        ]
    },
    {
        title: "元素操作",
        children: [
            { label: "移动", value: "↑ / ← / ↓ / →" }
        ]
    },
    {
        title: "幻灯片放映",
        children: [
            { label: "上一页", value: "↑ / ←" },
            { label: "下一页", value: "↓ / →" },
            { label: "退出放映", value: "ESC" }
        ]
    }
];
