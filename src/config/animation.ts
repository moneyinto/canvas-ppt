export const ANIMATION_IN = [
    {
        type: "back",
        name: "放大滑入",
        children: [
            { name: "向下放大滑入", value: "backInDown", duration: 1000 },
            { name: "从左放大滑入", value: "backInLeft", duration: 1000 },
            { name: "从右放大滑入", value: "backInRight", duration: 1000 },
            { name: "向上放大滑入", value: "backInUp", duration: 1000 }
        ]
    },
    {
        type: "bounce",
        name: "弹跳",
        children: [
            { name: "弹入", value: "bounceIn", duration: 750 },
            { name: "向右弹入", value: "bounceInLeft", duration: 1000 },
            { name: "向左弹入", value: "bounceInRight", duration: 1000 },
            { name: "向上弹入", value: "bounceInUp", duration: 1000 },
            { name: "向下弹入", value: "bounceInDown", duration: 1000 }
        ]
    },

    {
        type: "fade",
        name: "浮现",
        children: [
            { name: "浮入", value: "fadeIn", duration: 1000 },
            { name: "向下浮入", value: "fadeInDown", duration: 1000 },
            { name: "向下长距浮入", value: "fadeInDownBig", duration: 1000 },
            { name: "向右浮入", value: "fadeInLeft", duration: 1000 },
            { name: "向右长距浮入", value: "fadeInLeftBig", duration: 1000 },
            { name: "向左浮入", value: "fadeInRight", duration: 1000 },
            { name: "向左长距浮入", value: "fadeInRightBig", duration: 1000 },
            { name: "向上浮入", value: "fadeInUp", duration: 1000 },
            { name: "向上长距浮入", value: "fadeInUpBig", duration: 1000 },
            { name: "从左上浮入", value: "fadeInTopLeft", duration: 1000 },
            { name: "从右上浮入", value: "fadeInTopRight", duration: 1000 },
            { name: "从左下浮入", value: "fadeInBottomLeft", duration: 1000 },
            { name: "从右下浮入", value: "fadeInBottomRight", duration: 1000 }
        ]
    },
    {
        type: "flip",
        name: "翻转",
        children: [
            { name: "X轴翻转进入", value: "flipInX", duration: 1000 },
            { name: "Y轴翻转进入", value: "flipInY", duration: 1000 }
        ]
    },
    {
        type: "lightSpeed",
        name: "飞入",
        children: [
            { name: "从右飞入", value: "lightSpeedInRight", duration: 1000 },
            { name: "从左飞入", value: "lightSpeedInLeft", duration: 1000 }
        ]
    },
    {
        type: "rotate",
        name: "旋转",
        children: [
            { name: "旋转进入", value: "rotateIn", duration: 1000 },
            { name: "绕左下进入", value: "rotateInDownLeft", duration: 1000 },
            { name: "绕右下进入", value: "rotateInDownRight", duration: 1000 },
            { name: "绕左上进入", value: "rotateInUpLeft", duration: 1000 },
            { name: "绕右上进入", value: "rotateInUpRight", duration: 1000 }
        ]
    },
    {
        type: "zoom",
        name: "缩放",
        children: [
            { name: "放大进入", value: "zoomIn", duration: 1000 },
            { name: "向下放大进入", value: "zoomInDown", duration: 1000 },
            { name: "从左放大进入", value: "zoomInLeft", duration: 1000 },
            { name: "从右放大进入", value: "zoomInRight", duration: 1000 },
            { name: "向上放大进入", value: "zoomInUp", duration: 1000 }
        ]
    },
    {
        type: "slide",
        name: "滑入",
        children: [
            { name: "向下滑入", value: "slideInDown", duration: 500 },
            { name: "从右滑入", value: "slideInLeft", duration: 500 },
            { name: "从左滑入", value: "slideInRight", duration: 500 },
            { name: "向上滑入", value: "slideInUp", duration: 500 }
        ]
    },
    {
        type: "special",
        name: "其他",
        children: [
            { name: "盒飞入", value: "jackInTheBox", duration: 750 },
            { name: "滚入", value: "rollIn", duration: 750 }
        ]
    }
];

export const ANIMATION_OUT = [
    {
        type: "back",
        name: "放大滑出",
        children: [
            { name: "向下放大滑出", value: "backOutDown", duration: 1000 },
            { name: "从左放大滑出", value: "backOutLeft", duration: 1000 },
            { name: "从右放大滑出", value: "backOutRight", duration: 1000 },
            { name: "向上放大滑出", value: "backOutUp", duration: 1000 }
        ]
    },
    {
        type: "bounce",
        name: "弹跳",
        children: [
            { name: "弹出", value: "bounceOut", duration: 750 },
            { name: "向右弹出", value: "bounceOutLeft", duration: 1000 },
            { name: "向左弹出", value: "bounceOutRight", duration: 1000 },
            { name: "向上弹出", value: "bounceOutUp", duration: 1000 },
            { name: "向下弹出", value: "bounceOutDown", duration: 1000 }
        ]
    },
    {
        type: "fade",
        name: "浮现",
        children: [
            { name: "浮出", value: "fadeOut", duration: 1000 },
            { name: "向下浮出", value: "fadeOutDown", duration: 1000 },
            { name: "向下长距浮出", value: "fadeOutDownBig", duration: 1000 },
            { name: "向右浮出", value: "fadeOutLeft", duration: 1000 },
            { name: "向右长距浮出", value: "fadeOutLeftBig", duration: 1000 },
            { name: "向左浮出", value: "fadeOutRight", duration: 1000 },
            { name: "向左长距浮出", value: "fadeOutRightBig", duration: 1000 },
            { name: "向上浮出", value: "fadeOutUp", duration: 1000 },
            { name: "向上长距浮出", value: "fadeOutUpBig", duration: 1000 },
            { name: "从左上浮出", value: "fadeOutTopLeft", duration: 1000 },
            { name: "从右上浮出", value: "fadeOutTopRight", duration: 1000 },
            { name: "从左下浮出", value: "fadeOutBottomLeft", duration: 1000 },
            { name: "从右下浮出", value: "fadeOutBottomRight", duration: 1000 }
        ]
    },
    {
        type: "flip",
        name: "翻转",
        children: [
            { name: "X轴翻转退出", value: "flipOutX", duration: 750 },
            { name: "Y轴翻转退出", value: "flipOutY", duration: 750 }
        ]
    },
    {
        type: "lightSpeed",
        name: "飞出",
        children: [
            { name: "向右飞出", value: "lightSpeedOutRight", duration: 1000 },
            { name: "向左飞出", value: "lightSpeedOutLeft", duration: 1000 }
        ]
    },
    {
        type: "rotate",
        name: "旋转",
        children: [
            { name: "旋转退出", value: "rotateOut", duration: 1000 },
            { name: "绕左下退出", value: "rotateOutDownLeft", duration: 1000 },
            { name: "绕右下退出", value: "rotateOutDownRight", duration: 1000 },
            { name: "绕左上退出", value: "rotateOutUpLeft", duration: 1000 },
            { name: "绕右上退出", value: "rotateOutUpRight", duration: 1000 }
        ]
    },
    {
        type: "zoom",
        name: "缩放",
        children: [
            { name: "缩小退出", value: "zoomOut", duration: 1000 },
            { name: "向下缩小退出", value: "zoomOutDown", duration: 1000 },
            { name: "从左缩小退出", value: "zoomOutLeft", duration: 1000 },
            { name: "从右缩小退出", value: "zoomOutRight", duration: 1000 },
            { name: "向上缩小退出", value: "zoomOutUp", duration: 1000 }
        ]
    },
    {
        type: "slide",
        name: "滑出",
        children: [
            { name: "向下滑出", value: "slideOutDown", duration: 750 },
            { name: "从右滑出", value: "slideOutLeft", duration: 750 },
            { name: "从左滑出", value: "slideOutRight", duration: 750 },
            { name: "向上滑出", value: "slideOutUp", duration: 750 }
        ]
    },
    {
        type: "special",
        name: "其他",
        children: [
            { name: "铰链", value: "hinge", duration: 2000 },
            { name: "滚出", value: "rollOut", duration: 750 }
        ]
    }
];

export const ANIMATION_ATTENTION = [
    {
        type: "shake",
        name: "晃动",
        children: [
            { name: "左右摇晃", value: "shakeX", duration: 1000 },
            { name: "上下摇晃", value: "shakeY", duration: 1000 },
            { name: "摇头", value: "headShake", duration: 1000 },
            { name: "摆动", value: "swing", duration: 1000 },
            { name: "晃动", value: "wobble", duration: 1000 },
            { name: "惊恐", value: "tada", duration: 1000 },
            { name: "果冻", value: "jello", duration: 1000 }
        ]
    },
    {
        type: "other",
        name: "其他",
        children: [
            { name: "弹跳", value: "bounce", duration: 1000 },
            { name: "闪烁", value: "flash", duration: 1000 },
            { name: "脉搏", value: "pulse", duration: 1000 },
            { name: "橡皮筋", value: "rubberBand", duration: 1000 },
            { name: "心跳（快）", value: "heartBeat", duration: 1300 }
        ]
    }
];
