<template>
    <img class="ppt-icon" :style="{ width: `${size}px` }" :src="iconUrl" alt="">
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue";

const porps = defineProps({
    size: {
        type: Number,
        default: 24
    },

    icon: {
        type: String,
        required: true
    }
});

const { size, icon } = toRefs(porps);

const icons: { [key: string]: string } = {
    undo: new URL("@/assets/icons/undo.svg", import.meta.url).href,
    redo: new URL("@/assets/icons/redo.svg", import.meta.url).href,
    cut: new URL("@/assets/icons/cut.svg", import.meta.url).href,
    copy: new URL("@/assets/icons/copy.svg", import.meta.url).href,
    paste: new URL("@/assets/icons/paste.svg", import.meta.url).href,
    all: new URL("@/assets/icons/all.svg", import.meta.url).href,
    plus: new URL("@/assets/icons/plus.svg", import.meta.url).href,
    minus: new URL("@/assets/icons/minus.svg", import.meta.url).href,
    fit: new URL("@/assets/icons/fit.svg", import.meta.url).href,
    add: new URL("@/assets/icons/add.svg", import.meta.url).href,
    down: new URL("@/assets/icons/down.svg", import.meta.url).href,
    image: new URL("@/assets/icons/image.svg", import.meta.url).href,
    shape: new URL("@/assets/icons/shape.svg", import.meta.url).href,
    save: new URL("@/assets/icons/save.svg", import.meta.url).href,
    top: new URL("@/assets/icons/top.svg", import.meta.url).href,
    bottom: new URL("@/assets/icons/bottom.svg", import.meta.url).href,
    moveUp: new URL("@/assets/icons/moveUp.svg", import.meta.url).href,
    moveDown: new URL("@/assets/icons/moveDown.svg", import.meta.url).href,
    fillColor: new URL("@/assets/icons/fillColor.svg", import.meta.url).href,
    borderColor: new URL("@/assets/icons/borderColor.svg", import.meta.url).href,
    flipV: new URL("@/assets/icons/flipV.svg", import.meta.url).href,
    flipH: new URL("@/assets/icons/flipH.svg", import.meta.url).href,
    borderWidth: new URL("@/assets/icons/borderWidth.svg", import.meta.url).href,
    borderStyle: new URL("@/assets/icons/borderStyle.svg", import.meta.url).href,
    checked: new URL("@/assets/icons/checked.svg", import.meta.url).href,
    text: new URL("@/assets/icons/text.svg", import.meta.url).href,
    plusSize: new URL("@/assets/icons/plusSize.svg", import.meta.url).href,
    minusSize: new URL("@/assets/icons/minusSize.svg", import.meta.url).href,
    boldFont: new URL("@/assets/icons/boldFont.svg", import.meta.url).href,
    italicFont: new URL("@/assets/icons/italicFont.svg", import.meta.url).href,
    underline: new URL("@/assets/icons/underline.svg", import.meta.url).href,
    strikout: new URL("@/assets/icons/strikout.svg", import.meta.url).href,
    fontColor: new URL("@/assets/icons/fontColor.svg", import.meta.url).href,
    alignLeft: new URL("@/assets/icons/alignLeft.svg", import.meta.url).href,
    alignCenter: new URL("@/assets/icons/alignCenter.svg", import.meta.url).href,
    alignRight: new URL("@/assets/icons/alignRight.svg", import.meta.url).href,
    lineHeight: new URL("@/assets/icons/lineHeight.svg", import.meta.url).href,
    canvasAlignCenter: new URL("@/assets/icons/canvasAlignCenter.svg", import.meta.url).href,
    canvasAlignLeft: new URL("@/assets/icons/canvasAlignLeft.svg", import.meta.url).href,
    canvasAlignRight: new URL("@/assets/icons/canvasAlignRight.svg", import.meta.url).href,
    canvasCenter: new URL("@/assets/icons/canvasCenter.svg", import.meta.url).href,
    canvasOneAlignCenter: new URL("@/assets/icons/canvasOneAlignCenter.svg", import.meta.url).href,
    canvasOneVerticalCenter: new URL("@/assets/icons/canvasOneVerticalCenter.svg", import.meta.url).href,
    canvasVerticalBottom: new URL("@/assets/icons/canvasVerticalBottom.svg", import.meta.url).href,
    canvasVerticalCenter: new URL("@/assets/icons/canvasVerticalCenter.svg", import.meta.url).href,
    canvasVerticalTop: new URL("@/assets/icons/canvasVerticalTop.svg", import.meta.url).href,
    opacity: new URL("@/assets/icons/opacity.svg", import.meta.url).href,
    allSelect: new URL("@/assets/icons/allSelect.svg", import.meta.url).href,
    background: new URL("@/assets/icons/background.svg", import.meta.url).href,
    close: new URL("@/assets/icons/close.svg", import.meta.url).href,
    shadow: new URL("@/assets/icons/shadow.svg", import.meta.url).href,
    video: new URL("@/assets/icons/video.svg", import.meta.url).href,
    latex: new URL("@/assets/icons/latex.svg", import.meta.url).href,
    audio: new URL("@/assets/icons/audio.svg", import.meta.url).href,
    chart: new URL("@/assets/icons/chart.svg", import.meta.url).href,
    bar_v: new URL("@/assets/icons/bar_v.svg", import.meta.url).href,
    bar_h: new URL("@/assets/icons/bar_h.svg", import.meta.url).href,
    line: new URL("@/assets/icons/line.svg", import.meta.url).href,
    pie: new URL("@/assets/icons/pie.svg", import.meta.url).href,
    funnel: new URL("@/assets/icons/funnel.svg", import.meta.url).href,
    preview: new URL("@/assets/icons/preview.svg", import.meta.url).href,
    upload: new URL("@/assets/icons/upload.svg", import.meta.url).href,
    anticlockwise: new URL("@/assets/icons/anticlockwise.svg", import.meta.url).href,
    clockwise: new URL("@/assets/icons/clockwise.svg", import.meta.url).href,
    demonstrate: new URL("@/assets/icons/demonstrate.svg", import.meta.url).href,
    fullScreen: new URL("@/assets/icons/fullScreen.svg", import.meta.url).href,
    offScreen: new URL("@/assets/icons/offScreen.svg", import.meta.url).href,
    endPreview: new URL("@/assets/icons/endPreview.svg", import.meta.url).href,
    leftArrow: new URL("@/assets/icons/leftArrow.svg", import.meta.url).href,
    rightArrow: new URL("@/assets/icons/rightArrow.svg", import.meta.url).href,
    pencil: new URL("@/assets/icons/pencil.svg", import.meta.url).href,
    table: new URL("@/assets/icons/table.svg", import.meta.url).href
};

const iconUrl = computed(() => icons[icon.value]);
</script>

<style scoped>
.ppt-icon {
    /* display: block; */
    vertical-align: top;
}
</style>
