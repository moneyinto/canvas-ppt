<template>
    <div class="white-board" ref="whiteboard">
        <canvas
            ref="canvas"
            :width="canvasWidth"
            :height="canvasHeighth"
            @mousewheel.passive="wheelScaleCanvas"
            :style="{
                width: canvasDomWidth,
                height: canvasDomHeight,
                cursor: cursor
            }"
        ></canvas>

        <Compass
            :canvasConfig="canvasConfig"
            @close="closeTool"
            @draw-start="drawStart"
            @drawing="drawing"
            @draw-end="drawEnd"
            v-if="canvasConfig.optionType === OPTION_TYPE.COMPASS"
        />

        <Ruler
            :canvasConfig="canvasConfig"
            :elements="elements"
            @close="closeTool"
            @draw-start="drawStart"
            @drawing="drawing"
            @draw-end="drawEnd"
            v-if="canvasConfig.optionType === OPTION_TYPE.RULER"
        />

        <Protractor
            :canvasConfig="canvasConfig"
            @close="closeTool"
            v-if="canvasConfig.optionType === OPTION_TYPE.PROTRACTOR"
        />
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    nextTick,
    reactive,
    onUnmounted,
    computed,
    defineEmits,
    defineProps,
    defineExpose,
    PropType,
    watch,
    toRefs,
    provide
} from "vue";
import { IElement, ICanvasConfig, IOptionsConfig } from "./types";
import { OPTION_TYPE } from "./config";
import { throttle } from "lodash";
import useHandlePointer from "./hooks/useHandlePointer";
import useRenderElement from "./hooks/useRenderElement";
import useZoom from "./hooks/useZoom";
import useDrawElement from "./hooks/useDrawElement";
import Compass from "./components/compass/index.vue";
import Ruler from "./components/ruler/index.vue";
import Protractor from "./components/protractor/index.vue";

const emit = defineEmits(["scrollChange", "zoomChange", "closeTool"]);

const props = defineProps({
    options: {
        type: Object as PropType<IOptionsConfig>,
        default: () => ({
            offsetX: 0,
            offsetY: 0
        })
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const { options, disabled } = toRefs(props);

watch(
    () => props.options,
    () => {
        canvasConfig.offsetX = options.value.offsetX;
        canvasConfig.offsetY = options.value.offsetY;
    }
);

const canvasScale = window.devicePixelRatio;
const whiteboard = ref<HTMLDivElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const canvasWidth = ref(0 * canvasScale);
const canvasHeighth = ref(0 * canvasScale);
const canvasDomWidth = ref(0 + "px");
const canvasDomHeight = ref(0 + "px");
const eraserIcon = new URL("./assets/images/circle.svg", import.meta.url).href;
const storeElements = ref<IElement[]>([]);

// 禁用触摸屏下双指触发右键菜单 影响缩放
document.oncontextmenu = () => {
    return false;
};

const cursor = computed(() => {
    if (canvasConfig.isMoveOrScale) return "grabbing";
    return {
        MOUSE: "default",
        PEN: "crosshair",
        ERASER: `url(${eraserIcon}) 20 20, auto`
    }[canvasConfig.optionType];
});

// 画布配置
const canvasConfig = reactive<ICanvasConfig>({
    offsetX: options.value.offsetX,
    offsetY: options.value.offsetY,
    scrollX: 0,
    scrollY: 0,
    zoom: 1,
    optionType: OPTION_TYPE.MOUSE,
    lineWidth: 5,
    strokeColor: "#f60000",
    isDrawing: false,
    isMoveOrScale: false
});

watch([() => canvasConfig.scrollX, () => canvasConfig.scrollY], () => {
    emit("scrollChange", {
        scrollX: canvasConfig.scrollX,
        scrollY: canvasConfig.scrollY
    });
});

watch(
    () => canvasConfig.zoom,
    () => {
        emit("zoomChange", canvasConfig.zoom);
    }
);

// 是否支持触摸
const canTouch = "ontouchstart" in window;
provide("canTouch", canTouch);
provide("disabled", disabled.value);

// 绘制元素集合
const elements = ref<IElement[]>([]);
const { handleDown } = useHandlePointer(
    canvas,
    context,
    elements,
    storeElements,
    canvasConfig,
    disabled
);
const { renderElements } = useRenderElement(canvas, context, canvasConfig);
const { handleWeel } = useZoom(canvas, canvasConfig);
const { drawStart, drawing, drawEnd } = useDrawElement(
    canvas,
    context,
    elements,
    storeElements,
    canvasConfig
);

const wheelScaleCanvas = throttle((event: WheelEvent) => {
    if (canvasConfig.optionType === OPTION_TYPE.MOUSE) {
        handleWeel(event.pageX, event.pageY, event.deltaY);
        renderElements(elements.value);
    }
}, 30);

nextTick(async () => {
    if (!canvas.value || !whiteboard.value) return;
    context.value = canvas.value.getContext("2d");

    canvas.value.addEventListener("touchstart", handleDown, { passive: true });
    canvas.value.addEventListener("pointerdown", handleDown);

    // 区域大小变化重置canvas
    const resize = throttle(() => {
        if (!whiteboard.value || !context.value) return;
        canvasWidth.value = whiteboard.value.clientWidth * canvasScale;
        canvasHeighth.value = whiteboard.value.clientHeight * canvasScale;
        canvasDomWidth.value = whiteboard.value.clientWidth + "px";
        canvasDomHeight.value = whiteboard.value.clientHeight + "px";

        context.value.scale(canvasScale, canvasScale);
        context.value.setTransform(1, 0, 0, 1, 0, 0);
        context.value.save();

        nextTick(async () => {
            renderElements(elements.value);
        });
    }, 100);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(whiteboard.value);
});

onUnmounted(() => {
    if (canvas.value) {
        canvas.value.removeEventListener("touchstart", handleDown);
        canvas.value.removeEventListener("pointerdown", handleDown);
    }
});

// 画布滚动
const setScroll = (x: number, y: number) => {
    canvasConfig.scrollX = x;
    canvasConfig.scrollY = y;
};

// 画布缩放
const setZoom = (zoom: number) => {
    if (zoom < 0.1) return (canvasConfig.zoom = 0.1);
    canvasConfig.zoom = zoom;
};

// 设置操作模式
const setOptionType = (type: string) => {
    canvasConfig.optionType = type;
};

// 设置画笔宽度
const setLineWidth = (width: number) => {
    canvasConfig.lineWidth = width;
};

// 设置画笔颜色
const setDrawColor = (color: string) => {
    canvasConfig.strokeColor = color;
};

// 渲染
const render = (inElements?: IElement[]) => {
    renderElements(inElements || elements.value);
};

// 获取元素数据
const getElements = () => {
    return elements.value;
};

// 设置元素数据
const setElements = (data: IElement[]) => {
    elements.value = data;
};

// 复位
const reset = () => {
    canvasConfig.zoom = 1;
    canvasConfig.scrollX = 0;
    canvasConfig.scrollY = 0;
};

// 撤销
const undo = () => {
    if (elements.value.length === 0) return;
    const element = elements.value.pop();
    storeElements.value.push(element!);
    render();
};

// 能否撤销
const canUndo = computed(() => elements.value.length > 0);

// 恢复
const redo = () => {
    if (storeElements.value.length === 0) return;
    const element = storeElements.value.pop();
    elements.value.push(element!);
    render();
};

// 能否恢复
const canRedo = computed(() => storeElements.value.length > 0);

// 清空元素
const clear = () => {
    elements.value = [];
    render();
};

// 关闭工具
const closeTool = () => {
    setOptionType(OPTION_TYPE.PEN);
    emit("closeTool");
};

defineExpose({
    setScroll,
    setZoom,
    setOptionType,
    setLineWidth,
    setDrawColor,
    render,
    getElements,
    setElements,
    reset,
    clear,
    undo,
    redo,
    canUndo,
    canRedo
});
</script>

<style>
.white-board {
    width: 100%;
    height: 100%;
    position: relative;
    color: #333;
    user-select: none;
}

.eraser {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAARRJREFUOE/dlDFLxEAQhd+BVouFZ3vlQuwSyI+5a7PBRkk6k9KzTOwStJFsWv0xgaQzkNLWszim0kL2OOFc9oKRYHFTz37Lm/dmJhi5JiPzcBjAOYDz7WheADz3jalP8oIxds85P3Zd90RBqqpad133SUSXAJ5M4H3AhWVZd1EUzYQQP96VZYkkSV7btr02QY1Axtgqz/NTz/OM6qSUCMNwRURneoMJOLdt+7Gu643MfeU4zrppmgt9pibgjRBiWRRFb0R934eUcgngdrfxX4CjSwZj7C3Lsqnu8Lc05XQQBO9ENP2NKapnE5s4jme608rhNE2HxWb7qwr2A+f8SAv2BxFdDQ32rpLRVu9Pl+0wztcg6V/VPW4Vw1FsawAAAABJRU5ErkJggg==")
            10 10,
        auto;
}
</style>
