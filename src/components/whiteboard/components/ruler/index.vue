<template>
    <div class="ruler-container" ref="ruler">
        <div
            class="ruler-box"
            :style="{
                width: `${width}px`,
                left: `${x}px`,
                top: `${y}px`,
                transform: `rotate(${angle}deg)`
            }"
        >
            <div class="ruler-scale-box">
                <div class="ruler-scale">
                    <div class="ruler-number" v-for="num in numberList" :key="num">
                        <span>{{ num + 1 }}</span>
                    </div>
                </div>
            </div>
            <div class="ruler-buttons">
                <div class="ruler-button ruler-close" @click="closeRuler()">
                    <img src="./images/close.svg" alt="" />
                </div>
                <div class="ruler-angle-text">
                    {{
                        viewText === "angle"
                            ? angle + "°"
                            : viewText === "length"
                            ? Math.abs(length) + "cm"
                            : ""
                    }}
                </div>
                <div class="ruler-button ruler-rotate">
                    <img src="./images/rotate.svg" alt="" />
                </div>
                <div class="ruler-button ruler-resize">
                    <img src="./images/resize.svg" alt="" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    computed,
    onMounted,
    PropType,
    ref,
    defineProps,
    defineEmits,
    onUnmounted,
    inject
} from "vue";
import { OPTION_TYPE } from "../../config";
import { ICanvasConfig, ICenter, IElement } from "../../types";
import { getAngle, getCanvasPointPosition, throttleRAF } from "../../utils";

// const canTouch = inject("canTouch");
const disabled = inject("disabled");

const props = defineProps({
    canvasConfig: {
        type: Object as PropType<ICanvasConfig>,
        required: true
    },
    elements: {
        type: Array as PropType<IElement[]>,
        required: true
    }
});

const emit = defineEmits(["close", "drawStart", "drawing", "drawEnd"]);

const canvasConfig = computed(() => props.canvasConfig);

const width = ref(500);
const x = ref(0);
const y = ref(0);
const angle = ref(0);
const ruler = ref();
const mode = ref("");
const viewText = ref("");
const startPoint = { x: 0, y: 0 };
const length = ref(0);
let startAngle = 0;
let drawLine = [
    [0, 0],
    [0, 0]
];
let rulerCenter = { x: 0, y: 0 };
let isAdsorption = false;

const dealForDrawLine = (center: ICenter, mousePoint: ICenter) => {
    const l = Math.hypot(center.x - mousePoint.x, center.y - mousePoint.y);
    const angleA = getAngle(mousePoint.x - center.x, mousePoint.y - center.y);
    const targetAngle = angleA - angle.value;
    if (targetAngle === 0) return l;
    const drawL = Math.abs(l * Math.sign((targetAngle * Math.PI) / 180));
    return drawL;
};

const handleMouseDown = (event: PointerEvent | TouchEvent) => {
    event.stopPropagation();
    if (disabled) return;
    if (event instanceof TouchEvent && event.touches.length > 1) return;
    const mouseX =
        event instanceof TouchEvent
            ? event.targetTouches[0] ? event.targetTouches[0].clientX : event.changedTouches[0].clientX
            : event.clientX;
    const mouseY =
        event instanceof TouchEvent
            ? event.targetTouches[0] ? event.targetTouches[0].clientY : event.changedTouches[0].clientY
            : event.clientY;
    startPoint.x = mouseX;
    startPoint.y = mouseY;
    if (
        event.target &&
        (event.target as Element).className === "ruler-buttons"
    ) {
        // move
        mode.value = "move";
        viewText.value = "";
    }

    if (
        event.target &&
        (event.target as Element).className === "ruler-button ruler-rotate"
    ) {
        // rotate
        mode.value = "rotate";
        viewText.value = "angle";
        startAngle = getAngle(
            mouseX - x.value - canvasConfig.value.offsetX,
            mouseY - y.value - canvasConfig.value.offsetY
        );
    }

    if (
        event.target &&
        (event.target as Element).className === "ruler-button ruler-resize"
    ) {
        // resize
        mode.value = "resize";
        viewText.value = "";
    }

    if (event.target && ((event.target as Element).className === "ruler-scale" || (event.target as Element).className === "ruler-number")) {
        // draw
        mode.value = "draw";
        viewText.value = "length";
        rulerCenter = getCanvasPointPosition(
            {
                x: x.value + canvasConfig.value.offsetX,
                y: y.value + canvasConfig.value.offsetY
            },
            canvasConfig.value
        );
        const point = getCanvasPointPosition(startPoint, canvasConfig.value);
        const line = dealForDrawLine(rulerCenter, point);
        drawLine = [
            [line, 0],
            [line, 0]
        ];
        length.value = 0;
        emit("drawStart", {
            ...rulerCenter,
            points: drawLine,
            angle: angle.value
        });
    }

    if (event instanceof TouchEvent) {
        document.addEventListener("touchmove", handleMouseMove, { passive: true });
        document.addEventListener("touchend", handleEnd, { passive: true });
    } else {
        document.addEventListener("pointermove", handleMouseMove, { passive: true });
        document.addEventListener("pointerup", handleEnd, { passive: true });
    }
};

const handleMouseMove = throttleRAF((event: PointerEvent | TouchEvent) => {
    event.stopPropagation();
    if (disabled || isAdsorption) return;
    if (event instanceof TouchEvent && event.touches.length > 1) return;
    const mouseX =
        event instanceof TouchEvent
            ? event.targetTouches[0] ? event.targetTouches[0].clientX : event.changedTouches[0].clientX
            : event.clientX;
    const mouseY =
        event instanceof TouchEvent
            ? event.targetTouches[0] ? event.targetTouches[0].clientY : event.changedTouches[0].clientY
            : event.clientY;

    if (mode.value === "move") {
        x.value += mouseX - startPoint.x;
        y.value += mouseY - startPoint.y;

        // 判断吸附
        // 往上移动，才做判断
        if (mouseY - startPoint.y < 0 && !isAdsorption) {
            const targetRulerElements = props.elements.filter(element => element.angle === angle.value && element.type === OPTION_TYPE.RULER);
            const targetElement = targetRulerElements.find(element => y.value - element.y < 10 && y.value - element.y > 0);
            if (targetElement) {
                y.value = targetElement.y;
                isAdsorption = true;
                setTimeout(() => {
                    // 完成吸附后 1s内禁止其他操作
                    isAdsorption = false;
                }, 1000);
            }
        }
    }

    if (mode.value === "rotate") {
        const targetAngle = getAngle(
            mouseX - x.value - canvasConfig.value.offsetX,
            mouseY - y.value - canvasConfig.value.offsetY
        );
        angle.value += targetAngle - startAngle;
        startAngle = targetAngle;
    }

    if (mode.value === "resize") {
        width.value += mouseX - startPoint.x;
        if (width.value < 500) width.value = 500;
        updateNumberList();
    }

    startPoint.x = mouseX;
    startPoint.y = mouseY;

    if (mode.value === "draw") {
        const point = getCanvasPointPosition(startPoint, canvasConfig.value);
        const line = dealForDrawLine(rulerCenter, point);
        drawLine[1] = [line, 0];
        length.value = Math.round((line - drawLine[0][0]) / 4) / 10;
        emit("drawing", {
            points: drawLine,
            angle: angle.value
        });
    }
});

const handleEnd = (event) => {
    mode.value = "";
    emit("drawEnd");
    if (event instanceof TouchEvent) {
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleEnd);
    } else {
        document.removeEventListener("pointermove", handleMouseMove);
        document.removeEventListener("pointerup", handleEnd);
    }
};

const closeRuler = () => {
    emit("close");
};

const numberList = ref<number[]>([]);
const updateNumberList = () => {
    const length = Math.floor((width.value - 20) / 40);
    numberList.value = Array.from({ length }, (v, k) => k);
};

onMounted(() => {
    if (ruler.value) {
        x.value = ruler.value.clientWidth / 2 - 250;
        y.value = ruler.value.clientHeight / 2 - 30;
    }

    document.addEventListener("touchstart", handleMouseDown, { passive: true });
    document.addEventListener("pointerdown", handleMouseDown, { passive: true });

    updateNumberList();
});

onUnmounted(() => {
    document.removeEventListener("touchstart", handleMouseDown);
    document.removeEventListener("pointerdown", handleMouseDown);
});
</script>

<style lang="scss" scoped>
.ruler-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.ruler-box {
    position: absolute;
    transform-origin: top left;
    border-radius: 4px;
    overflow: hidden;
}

.ruler-scale-box {
    height: 20px;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0 10px;
}

.ruler-scale {
    position: relative;
    display: flex;
    height: 20px;
    background-image: url(./images/scale.png);
    background-repeat: repeat-x;
    background-size: 600px 25px;
}

.ruler-number {
    font-size: 12px;
    width: 40px;
    min-width: 40px;
    position: relative;
    span {
        display: block;
        position: absolute;
        top: 20px;
        right: 0;
        transform: translateX(50%);
    }
    &:first-child::before {
        content: "0";
        display: block;
        position: absolute;
        top: 20px;
        left: 0;
        transform: translateX(-50%);
    }
}

.ruler-buttons {
    height: 87px;
    display: flex;
    align-items: center;
    cursor: move;
    background-color: rgba(248, 248, 248, 0.8);
}

.ruler-button {
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    height: 48px;
    width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
    img {
        display: block;
        width: 32px;
        height: 32px;
        -webkit-user-drag: none;
        pointer-events: none;
    }

    &.ruler-close {
        margin-left: 20px;
        cursor: pointer;
    }

    &.ruler-resize {
        margin-right: 20px;
        cursor: default;
    }

    &.ruler-rotate {
        margin-right: 20px;
        cursor: default;
    }
}

.ruler-angle-text {
    flex: 1;
    font-size: 28px;
    font-weight: 600;
    color: #666666;
    text-align: center;
    line-height: 30px;
    margin-left: 48px;
    margin-right: 48px;
    pointer-events: none;
}
</style>
