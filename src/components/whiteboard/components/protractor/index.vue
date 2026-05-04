<template>
    <div class="protractor-container" ref="protractor">
        <div
            class="protractor"
            :style="{
                top: `${y - r / 2}px`,
                left: `${x - r}px`,
                width: `${2 * r}px`,
                height: `${r}px`,
                borderTopLeftRadius: `${r}px`,
                borderTopRightRadius: `${r}px`,
                transform: `rotate(${protractorAngle}deg)`
            }"
        >
            <div class="protractor-angle">∠{{ angle }}°</div>

            <div
                class="protractor-angle-line"
                :style="{ transform: `rotate(${startAngle}deg)` }"
            >
                <div class="protractor-angle-circle start"></div>
            </div>

            <div
                class="protractor-angle-line"
                :style="{ transform: `rotate(${endAngle}deg)` }"
            >
                <div class="protractor-angle-circle end"></div>
            </div>

            <div
                class="protractor-button protractor-close"
                @click="closeProtractor()"
            >
                <img src="./images/close.svg" alt="" />
            </div>

            <div class="protractor-button protractor-resize">
                <img src="./images/resize.svg" alt="" />
            </div>

            <div class="protractor-button protractor-rotate">
                <img src="./images/rotate.svg" alt="" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    onMounted,
    onUnmounted,
    PropType,
    ref,
    defineProps,
    computed,
    defineEmits,
    inject
} from "vue";
import { ICanvasConfig } from "../../types";
import { getAngle, throttleRAF } from "../../utils";

// const canTouch = inject("canTouch");
const disabled = inject("disabled");

const props = defineProps({
    canvasConfig: {
        type: Object as PropType<ICanvasConfig>,
        required: true
    }
});

const emit = defineEmits(["close"]);

const canvasConfig = computed(() => props.canvasConfig);

const x = ref(0);
const y = ref(0);
const r = ref(200);
const angle = ref(30);
const startAngle = ref(0);
const endAngle = ref(-30);
const protractorAngle = ref(0);
const protractor = ref();
const startPoint = { x: 0, y: 0 };
let logStartAngle = 0;
let mode = "";

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
    if (event.target && (event.target as Element).className === "protractor") {
        // move
        mode = "move";
    }

    if (
        event.target &&
        (event.target as Element).className ===
            "protractor-button protractor-resize"
    ) {
        // resize
        mode = "resize";
    }

    if (
        event.target &&
        (event.target as Element).className ===
            "protractor-button protractor-rotate"
    ) {
        // rotate
        mode = "rotate";
        logStartAngle = getAngle(
            mouseX - x.value - canvasConfig.value.offsetX,
            mouseY - y.value - canvasConfig.value.offsetY
        );
    }

    if (
        event.target &&
        (event.target as Element).className === "protractor-angle-circle start"
    ) {
        // start angle
        mode = "startAngle";
        logStartAngle = getAngle(
            mouseX - x.value - canvasConfig.value.offsetX,
            mouseY - y.value - canvasConfig.value.offsetY
        );
    }

    if (
        event.target &&
        (event.target as Element).className === "protractor-angle-circle end"
    ) {
        // end angle
        mode = "endAngle";
        logStartAngle = getAngle(
            mouseX - x.value - canvasConfig.value.offsetX,
            mouseY - y.value - canvasConfig.value.offsetY
        );
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
    if (mode === "move") {
        x.value += mouseX - startPoint.x;
        y.value += mouseY - startPoint.y;
    }

    if (mode === "resize") {
        let reduce = startPoint.y - mouseY;
        if (r.value + reduce < 200) {
            reduce = 200 - r.value;
            r.value = 200;
        } else {
            r.value += reduce;
        }

        y.value -= reduce / 2;
    }

    if (mode === "rotate") {
        const targetAngle = getAngle(
            mouseX - x.value - canvasConfig.value.offsetX,
            mouseY - y.value - canvasConfig.value.offsetY
        );
        protractorAngle.value += targetAngle - logStartAngle;
        logStartAngle = targetAngle;
    }

    if (mode === "startAngle") {
        const targetAngle = getAngle(
            mouseX - x.value - canvasConfig.value.offsetX,
            mouseY - y.value - canvasConfig.value.offsetY
        );
        let reduceAngle = targetAngle - logStartAngle;
        if (reduceAngle > 90 || reduceAngle < -90) reduceAngle = 0;
        startAngle.value += reduceAngle;
        if (startAngle.value <= -360) startAngle.value = 0;
        if (startAngle.value > 0) startAngle.value = startAngle.value - 360;
        logStartAngle = targetAngle;

        angle.value = Math.abs(startAngle.value - endAngle.value);
        if (angle.value > 180) angle.value = 360 - angle.value;
    }

    if (mode === "endAngle") {
        const targetAngle = getAngle(
            mouseX - x.value - canvasConfig.value.offsetX,
            mouseY - y.value - canvasConfig.value.offsetY
        );

        let reduceAngle = targetAngle - logStartAngle;
        if (reduceAngle > 90 || reduceAngle < -90) reduceAngle = 0;
        endAngle.value += reduceAngle;
        if (endAngle.value <= -360) endAngle.value = 0;
        if (endAngle.value > 0) endAngle.value = endAngle.value - 360;
        logStartAngle = targetAngle;

        angle.value = Math.abs(startAngle.value - endAngle.value);
        if (angle.value > 180) angle.value = 360 - angle.value;
    }

    startPoint.x = mouseX;
    startPoint.y = mouseY;
});

const handleEnd = (event) => {
    mode = "";
    if (event instanceof TouchEvent) {
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleEnd);
    } else {
        document.removeEventListener("pointermove", handleMouseMove);
        document.removeEventListener("pointerup", handleEnd);
    }
};

const closeProtractor = () => {
    emit("close");
};

onMounted(() => {
    if (protractor.value) {
        x.value = protractor.value.clientWidth / 2;
        y.value = protractor.value.clientHeight / 2;
    }

    document.addEventListener("touchstart", handleMouseDown, { passive: true });
    document.addEventListener("pointerdown", handleMouseDown, { passive: true });
});

onUnmounted(() => {
    document.removeEventListener("touchstart", handleMouseDown);
    document.removeEventListener("pointerdown", handleMouseDown);
});
</script>

<style scoped lang="scss">
.protractor-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.protractor {
    position: absolute;
    background-color: rgba(248, 248, 248, 0.8);
    cursor: move;
    transform-origin: bottom center;
    background-image: url(./images/protractor.svg);
    background-size: 100% 100%;
}

.protractor-angle {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    color: rgb(0, 123, 195);
    font-size: 26px;
    font-weight: 600;
}

.protractor-angle-line {
    position: absolute;
    width: calc(50% + 30px);
    border-top: 2px solid rgb(0, 123, 195);
    bottom: 2px;
    left: 50%;
    transform-origin: center left;
    .protractor-angle-circle {
        width: 20px;
        height: 20px;
        box-sizing: border-box;
        border-radius: 10px;
        border: 1px solid rgb(0, 123, 195);
        position: absolute;
        right: -10px;
        bottom: -10px;
        background-color: #fff;
        z-index: 1;
        cursor: default;
    }
}

.protractor-button {
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    height: 48px;
    width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
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

    &.protractor-close {
        margin-left: 20px;
        cursor: pointer;
        left: 16%;
        bottom: 20px;
    }

    &.protractor-resize {
        margin-right: 20px;
        cursor: default;
        left: 50%;
        transform: translateX(-50%) rotate(90deg);
        top: 35%;
    }

    &.protractor-rotate {
        margin-right: 20px;
        cursor: default;
        right: 16%;
        bottom: 20px;
    }
}
</style>
