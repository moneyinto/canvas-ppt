<template>
    <div class="compass-board" ref="compass">
        <div
            class="compass-box"
            :style="{
                transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`
            }"
        >
            <div class="compass-head-placeholder"></div>
            <div class="compass-leg">
                <div class="compass-left-leg">
                    <div class="left-leg-bg">
                        <div class="compass-center" ref="compassCenter"></div>
                    </div>
                </div>
                <div
                    class="compass-right-leg"
                    :style="{
                        transform: `rotate(${rightLegRotate}deg) translateY(-11px)`
                    }"
                >
                    <svg
                        style="width: 100%; overflow: visible; display: block"
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                    >
                        <path
                            d="M2 347 L13 338 L1 332.5 Z"
                            fill="#FF1000"
                        ></path>
                    </svg>
                    <div class="right-leg-zoom"></div>
                    <div class="right-leg-pen"></div>
                    <div class="pen-area" ref="penArea"></div>
                </div>
            </div>
            <div
                class="compass-head"
                :style="{
                    transform: `rotate(${(rightLegRotate + 15) / 2}deg)`
                }"
            >
                <div class="compass-close">
                    <div class="close-bg" @click="close()">
                        <img src="./images/head.svg" />
                    </div>
                </div>
                <div class="compass-drag-head">
                    <img
                        class="compass-drag-img"
                        src="./images/move.svg"
                    />
                </div>
                <div class="compass-scale">
                    <img
                        class="compass-scale-img"
                        src="./images/resize.svg"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    ref,
    defineProps,
    onMounted,
    defineEmits,
    PropType,
    computed,
    onUnmounted,
    nextTick,
    inject
} from "vue";
import { ICanvasConfig } from "../../types";
import { getAngle, getCanvasPointPosition, throttleRAF } from "../../utils";

const canTouch = inject("canTouch");
const disabled = inject("disabled");

let startAngle = 0;
let drawAngle = 0;
let recordAngle = 0;
let startPoint = [0, 0];
let mode = "";
let center = { x: 0, y: 0 };
let drawPoint = { x: 0, y: 0 };
// 圆心实际在canvas中的位置坐标
let canvasCircleCenter = { x: 0, y: 0 };

const x = ref(531);
const y = ref(108);
const rotate = ref(0);
const rightLegRotate = ref(-15);
const compass = ref();
const compassCenter = ref();
const penArea = ref();
const scale = ref(0.8);

const emit = defineEmits(["close", "drawStart", "drawing", "drawEnd"]);

const props = defineProps({
    canvasConfig: {
        type: Object as PropType<ICanvasConfig>,
        required: true
    }
});

const canvasConfig = computed(() => props.canvasConfig);

onMounted(() => {
    document.addEventListener("pointerdown", handleMouseDown, { passive: true });
    document.addEventListener("touchstart", handleMouseDown, { passive: true });
    nextTick(() => {
        x.value = compass.value.clientWidth / 2 - 109;
    });
});

onUnmounted(() => {
    document.removeEventListener("touchstart", handleMouseDown);
    document.removeEventListener("pointerdown", handleMouseDown);
});

const getDrawAngle = (x: number, y: number) => {
    const angle = Math.round(
        (Math.atan(Math.abs(y) / Math.abs(x)) / Math.PI) * 180
    );
    let resultAngle = 0;
    if (x > 0 && y < 0) {
        resultAngle = 360 - Math.abs(angle);
    } else if (x < 0 && y < 0) {
        resultAngle = 180 + Math.abs(angle);
    } else if (x < 0 && y > 0) {
        resultAngle = 180 - Math.abs(angle);
    } else {
        resultAngle = Math.abs(angle);
    }
    return resultAngle;
};

const getDrawPointer = () => {
    const { x, y } = penArea.value.getBoundingClientRect();
    return { x, y };
};

const getCompassCenter = () => {
    const { x, y } = compassCenter.value.getBoundingClientRect();
    // return getWhiteBoardPointPosition({ x: x as number, y: y as number }, canvasConfig.value);
    return { x, y };
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
    center = getCompassCenter();
    drawPoint = getDrawPointer();
    if (
        event.target &&
        (event.target as Element).className === "compass-scale"
    ) {
        mode = "setScale";
        startPoint = [mouseX, mouseY];
    }

    if (
        event.target &&
        (event.target as Element).className === "right-leg-zoom"
    ) {
        mode = "setAngle";
        startPoint = [mouseX, mouseY];
    }

    if (
        event.target &&
        (event.target as Element).className === "compass-drag-img"
    ) {
        mode = "move";
        startPoint = [mouseX, mouseY];
    }

    if (
        event.target &&
        (event.target as Element).className === "right-leg-pen"
    ) {
        mode = "draw";
        startAngle = getDrawAngle(
            drawPoint.x - center.x,
            drawPoint.y - center.y
        );
        startAngle = startAngle === 360 ? 0 : startAngle;
        recordAngle = startAngle;
        drawAngle = startAngle;
        startPoint = [mouseX, mouseY];
        canvasCircleCenter = getCanvasPointPosition(center, canvasConfig.value);
        emit("drawStart", {
            r: 0,
            startAngle,
            drawAngle,
            x: canvasCircleCenter.x,
            y: canvasCircleCenter.y
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

const handleMouseMove = throttleRAF((event: MouseEvent | TouchEvent) => {
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
    if (mode === "setAngle" || mode === "draw") {
        const moveX = mouseX - startPoint[0];
        const moveY = mouseY - startPoint[1];
        // startPoint = [mouseX, mouseY];

        let compassAngle = 0;
        let r = 0;
        const newDrawPoint = {
            x: drawPoint.x + moveX,
            y: drawPoint.y + moveY
        };

        if (mode === "setAngle") {
            // 通过鼠标移动，计算圆规绘制点的新坐标
            r = Math.hypot(
                newDrawPoint.x - center.x,
                newDrawPoint.y - center.y
            );

            compassAngle = ((2 * Math.asin(r / 2 / 348)) / Math.PI) * 180;
            rightLegRotate.value = 15 - compassAngle;
        } else {
            const angle = getDrawAngle(
                newDrawPoint.x - center.x,
                newDrawPoint.y - center.y
            );

            if (Math.abs(angle - recordAngle) > 180) {
                // 跨区域旋转
                drawAngle +=
                    (360 - Math.abs(angle - recordAngle)) *
                    Math.sign(angle - recordAngle);
            } else {
                drawAngle += angle - recordAngle;
            }

            recordAngle = angle;

            const drawCanvasPoint = getCanvasPointPosition(
                drawPoint,
                canvasConfig.value
            );
            r = Math.hypot(
                drawCanvasPoint.x - canvasCircleCenter.x,
                drawCanvasPoint.y - canvasCircleCenter.y
            );

            compassAngle = ((2 * Math.asin(r / 2 / 348)) / Math.PI) * 180;
            emit("drawing", {
                r,
                startAngle,
                drawAngle,
                x: canvasCircleCenter.x,
                y: canvasCircleCenter.y
            });
        }

        const angle = getAngle(
            newDrawPoint.x - center.x,
            newDrawPoint.y - center.y
        );
        rotate.value = compassAngle / 2 - 15 + angle;
    }

    if (mode === "setScale") {
        // 灵敏度控制值
        const sensitivity = 100;
        scale.value = scale.value + (startPoint[1] - mouseY) / sensitivity;
        if (scale.value < 0.5) scale.value = 0.5;
        startPoint = [mouseX, mouseY];
    }

    if (mode === "move") {
        x.value = x.value + mouseX - startPoint[0];
        y.value = y.value + mouseY - startPoint[1];
        startPoint = [mouseX, mouseY];
    }
});

const close = () => {
    emit("close");
};

const handleEnd = (event) => {
    emit("drawEnd");
    mode = "";
    if (event instanceof TouchEvent) {
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleEnd);
    } else {
        document.removeEventListener("pointermove", handleMouseMove);
        document.removeEventListener("pointerup", handleEnd);
    }
};
</script>

<style lang="scss" scoped>
.compass-board {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    // pointer-events: none;
    /* background: red; */
}

.compass-box {
    width: 218px;
    height: 505px;
    position: absolute;
    opacity: 1;
    z-index: 1;
    transform-origin: 21.5px 475px;
    top: 0;
    left: 0;
}

.compass-head-placeholder {
    height: 150px;
}

.compass-leg {
    width: 100%;
    height: 348px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
}

.compass-left-leg {
    width: 109px;
    height: 348px;
    display: flex;
    flex-direction: row-reverse;
    transform-origin: 109px 348px;
    transform: rotate(15deg) translateX(-90px);
}

.left-leg-bg {
    height: 348px;
    width: 43px;
    background-image: url(./images/left-leg.png);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
}

.compass-right-leg {
    width: 109px;
    height: 348px;
    background-image: url(./images/right-leg.png);
    background-size: 100% 100%;
    transform-origin: 0 0;
}

.right-leg-zoom {
    width: 32px;
    height: 32px;
    background-image: url(./images/adjust.svg);
    background-size: 100% 100%;
    margin: 109px 0 0 57px;
    pointer-events: all;
}

.right-leg-pen {
    width: 34px;
    height: 220px;
    margin: -154px 0 0 30px;
    transform: rotate(25deg);
    pointer-events: all;
    user-select: none;
}

.compass-head {
    margin: -502px auto 0;
    transform-origin: 109px 156px;
}

.compass-close {
    width: 60px;
    height: 60px;
    margin: auto;
}

.close-bg {
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 0 5px rgb(0 0 0 / 10%);
    height: 48px;
    width: 48px;
    margin: 0 auto;
    background: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: all;
    cursor: pointer;
}

.close-bg img {
    width: 28px;
    height: 28px;
    margin: 10px;
    display: block;
    -webkit-user-drag: none;
}

.compass-drag-head {
    height: 134px;
    width: 78px;
    background-image: url(./images/head-bg.png);
    background-size: 100% 100%;
    background-position: center;
    position: relative;
    margin: 0 auto;
}

.compass-drag-head img {
    width: 32px;
    height: 32px;
    margin: 70px 23px 0px;
    -webkit-user-drag: none;
    pointer-events: all;
    cursor: move;
}

.pen-area {
    position: absolute;
    left: 0;
    bottom: 0;
}

.compass-scale {
    position: absolute;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 150%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    border-radius: 50%;
    background: rgba(0, 0, 0, .05);
    cursor: row-resize;
}

.compass-scale-img {
    width: 40px;
    height: 40px;
    display: block;
    -webkit-user-drag: none;
    pointer-events: none;
}
</style>
