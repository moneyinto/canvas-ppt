<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="插入图片">
            <FileInput
                class="ppt-tool-btn"
                accept="image/*"
                @change="insertImage"
            >
                <PPTIcon icon="image" :size="28" />
            </FileInput>
        </a-tooltip>

        <a-tooltip title="插入视频">
            <FileInput
                class="ppt-tool-btn"
                accept="video/*"
                @change="insertVideo"
            >
                <PPTIcon icon="video" :size="28" />
            </FileInput>
        </a-tooltip>

        <a-tooltip title="插入音频">
            <FileInput
                class="ppt-tool-btn"
                style="padding: 0 8px"
                accept="audio/*"
                @change="insertAudio"
            >
                <PPTIcon icon="audio" :size="16" />
            </FileInput>
        </a-tooltip>

        <a-popover trigger="click" v-model:visible="showShapePool">
            <a-tooltip
                title="插入形状"
                :visible="!showShapePool && hoverShapePool"
            >
                <div
                    class="ppt-tool-btn"
                    @mouseover="hoverShapePool = true"
                    @mouseleave="hoverShapePool = false"
                >
                    <PPTIcon icon="shape" :size="28" />
                    &nbsp;
                    <PPTIcon icon="down" :size="6" />
                    &nbsp;
                </div>
            </a-tooltip>

            <template #content>
                <div class="shape-pool" @keydown.stop tabindex="0">
                    <div
                        class="category"
                        v-for="item in SHAPE_LIST"
                        :key="item.type"
                    >
                        <div class="category-name">{{ item.name }}</div>
                        <div class="shape-list">
                            <div
                                class="shape-item"
                                v-for="(shape, index) in item.children"
                                :key="index"
                                @click="selectShape(item.type, shape)"
                            >
                                <a-tooltip :title="shape.name">
                                    <SvgWrapper
                                        style="outline: 0"
                                        overflow="visible"
                                        width="18"
                                        height="18"
                                    >
                                        <g
                                            :transform="`scale(${
                                                18 / shape.viewBox
                                            }, ${
                                                18 / shape.viewBox
                                            }) translate(0,0) matrix(1,0,0,1,0,0)`"
                                        >
                                            <path
                                                class="shape-path"
                                                vector-effect="non-scaling-stroke"
                                                stroke-linecap="butt"
                                                stroke-miterlimit="8"
                                                :fill="
                                                    !!shape.fill
                                                        ? '#999'
                                                        : 'transparent'
                                                "
                                                stroke="#999"
                                                stroke-width="1px"
                                                :d="shape.path"
                                            ></path>
                                        </g>
                                    </SvgWrapper>
                                </a-tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </a-popover>

        <a-tooltip title="插入文字">
            <div
                class="ppt-tool-btn"
                :class="insertTextActive && 'active'"
                @click="insertText()"
            >
                <PPTIcon icon="text" :size="28" />
            </div>
        </a-tooltip>

        <a-popover trigger="click" v-model:visible="showChartPool">
            <a-tooltip
                title="插入图表"
                :visible="!showChartPool && hoverChartPool"
            >
                <div
                    class="ppt-tool-btn"
                    @mouseover="hoverChartPool = true"
                    @mouseleave="hoverChartPool = false"
                >
                    <PPTIcon icon="chart" :size="28" />
                    &nbsp;
                    <PPTIcon icon="down" :size="6" />
                    &nbsp;
                </div>
            </a-tooltip>

            <template #content>
                <div class="ppt-chart-content" @keydown.stop="" tabindex="0">
                    <div class="ppt-chart-item" @click="openChart('bar_h')">
                        <PPTIcon icon="bar_h" :size="28" />
                        <div class="ppt-chart-text">条形图</div>
                    </div>
                    <div class="ppt-chart-item" @click="openChart('bar_v')">
                        <PPTIcon icon="bar_v" :size="28" />
                        <div class="ppt-chart-text">柱状图</div>
                    </div>
                    <div class="ppt-chart-item" @click="openChart('line')">
                        <PPTIcon icon="line" :size="28" />
                        <div class="ppt-chart-text">折线图</div>
                    </div>
                    <div class="ppt-chart-item" @click="openChart('pie')">
                        <PPTIcon icon="pie" :size="28" />
                        <div class="ppt-chart-text">饼状图</div>
                    </div>
                    <div class="ppt-chart-item" @click="openChart('funnel')">
                        <PPTIcon icon="funnel" :size="28" />
                        <div class="ppt-chart-text">漏斗图</div>
                    </div>
                </div>
            </template>
        </a-popover>

        <a-tooltip title="插入公式">
            <div class="ppt-tool-btn" @click="openLatex()">
                <PPTIcon icon="latex" :size="28" />
            </div>
        </a-tooltip>

        <Latex
            v-model:visible="showLatex"
            :element="latexElement"
            @ok="insertOrUpdateLatex"
        />

        <Chart
            v-model:visible="showChart"
            :element="chartElement"
            :type="chartType"
            @ok="insertOrUpdateChart"
        />
    </div>
</template>

<script lang="ts" setup>
import SvgWrapper from "@/components/SvgWrapper.vue";
import Editor from "@/plugins/editor";
import FileInput from "@/components/FileInput.vue";
import Latex from "./Latex/index.vue";
import Chart from "./Chart/index.vue";
import { SHAPE_LIST } from "@/plugins/config/shapes";
import { ILineItem, IShapeItem } from "@/types/shape";
import { inject, onMounted, onUnmounted, ref, Ref, watch } from "vue";
import { ICreatingType, IPPTChartElement, IPPTLatexElement, ChartType } from "@/types/element";
import { fileMd5, dataURLtoFile } from "@/utils";
import {
    createImageElement,
    createLatexElement,
    createVideoElement,
    createAudioElement
} from "@/utils/create";
import emitter, { EmitterEvents } from "@/utils/emitter";

const showShapePool = ref(false);
const hoverShapePool = ref(false);
const showChartPool = ref(false);
const hoverChartPool = ref(false);
const showLatex = ref(false);
const showChart = ref(false);

const latexElement = ref<IPPTLatexElement>();
const chartElement = ref<IPPTChartElement>();

const instance = inject<Ref<Editor>>("instance");

watch(instance!, () => {
    if (instance?.value) {
        instance.value.listener.onInsertElementChange = (element) => {
            if (element && element.type === "text") {
                insertTextActive.value = true;
            } else {
                insertTextActive.value = false;
            }
        };
    }
});

onMounted(() => {
    emitter.on(EmitterEvents.OPEN_LATEX, openLatex);
    emitter.on(EmitterEvents.OPEN_CHART, openChart);
});

onUnmounted(() => {
    emitter.off(EmitterEvents.OPEN_LATEX, openLatex);
    emitter.off(EmitterEvents.OPEN_CHART, openChart);
});

const selectShape = (type: ICreatingType, shape: IShapeItem | ILineItem) => {
    showShapePool.value = false;
    if (type === "line") {
        instance?.value.stageConfig.setInsertElement({
            type,
            data: shape as ILineItem
        });
    } else if (type === "shape") {
        instance?.value.stageConfig.setInsertElement({
            type,
            data: shape as IShapeItem
        });
    }
};

const insertTextActive = ref(false);
const insertText = () => {
    if (!instance?.value.stageConfig.insertElement) {
        instance?.value.stageConfig.setInsertElement({
            type: "text"
        });
    }
};

const insertImage = async (files: File[]) => {
    const imageFile = files[0];
    if (!imageFile) return;
    const md5 = await fileMd5(imageFile);
    if (md5) {
        const reader = new FileReader();
        reader.addEventListener(
            "load",
            async () => {
                await instance?.value.history.saveFile(
                    md5,
                    reader.result as string
                );
                const image = new Image();
                image.onload = () => {
                    const element = createImageElement(
                        image.width,
                        image.height,
                        md5
                    );
                    instance?.value.command.executeAddRender([element]);
                };
                image.src = reader.result as string;
            },
            false
        );
        reader.readAsDataURL(imageFile);
    }
};

const insertVideo = async (files: File[]) => {
    const videoFile = files[0];
    if (!videoFile) return;
    const md5 = await fileMd5(videoFile);
    if (md5) {
        const reader = new FileReader();
        reader.addEventListener(
            "load",
            async () => {
                await instance?.value.history.saveFile(
                    md5,
                    reader.result as string
                );
                const element = createVideoElement(
                    300,
                    200,
                    md5
                    // window.URL.createObjectURL(new Blob([reader.result as ArrayBuffer]))
                );
                instance?.value.command.executeAddRender([element]);
            },
            false
        );
        reader.readAsDataURL(videoFile);
        // reader.readAsArrayBuffer(videoFile);
    }
};

const openLatex = (element?: IPPTLatexElement) => {
    latexElement.value = element;
    showLatex.value = true;
};

const insertOrUpdateLatex = async ({
    latex,
    src
}: {
    latex: string;
    src: string;
}) => {
    showLatex.value = false;
    const file = dataURLtoFile(src, "latex.svg", "image/svg+xml");
    const md5 = await fileMd5(file);
    if (md5) {
        await instance?.value.history.saveFile(md5, src);
        if (latexElement.value) {
            if (latexElement.value.text !== latex) {
                const image = new Image();
                image.onload = () => {
                    latexElement.value!.src = md5;
                    latexElement.value!.text = latex;
                    latexElement.value!.width = image.width;
                    latexElement.value!.height = image.height;
                    instance?.value.command.executeUpdateRender(
                        [JSON.parse(JSON.stringify(latexElement.value))],
                        true
                    );

                    latexElement.value = undefined;
                };
                image.src = src;
            }
        } else {
            const image = new Image();
            image.onload = () => {
                const element = createLatexElement(
                    image.width,
                    image.height,
                    md5,
                    latex
                );
                instance?.value.command.executeAddRender([element]);
            };
            image.src = src;
        }
    }
};

const insertAudio = async (files: File[]) => {
    const audioFile = files[0];
    if (!audioFile) return;
    const md5 = await fileMd5(audioFile);
    if (md5) {
        const reader = new FileReader();
        reader.addEventListener(
            "load",
            async () => {
                await instance?.value.history.saveFile(
                    md5,
                    reader.result as string
                );
                const element = createAudioElement(100, 100, md5);
                instance?.value.command.executeAddRender([element]);
            },
            false
        );
        reader.readAsDataURL(audioFile);
    }
};

const chartType = ref<ChartType>("bar_h");
const openChart = (arg: ChartType | IPPTChartElement) => {
    if (typeof arg === "string") {
        const type = arg as ChartType;
        chartElement.value = undefined;
        chartType.value = type;
    } else {
        chartElement.value = arg as IPPTChartElement;
    }

    showChart.value = true;
    showChartPool.value = false;
};

const insertOrUpdateChart = async () => {
    showLatex.value = false;
    // const file = dataURLtoFile(src, "latex.svg", "image/svg+xml");
    // const md5 = await fileMd5(file);
    // if (md5) {
    //     await instance?.value.history.saveFile(md5, src);
    //     if (latexElement.value) {
    //         if (latexElement.value.text !== latex) {
    //             const image = new Image();
    //             image.onload = () => {
    //                 latexElement.value!.src = md5;
    //                 latexElement.value!.text = latex;
    //                 latexElement.value!.width = image.width;
    //                 latexElement.value!.height = image.height;
    //                 instance?.value.command.executeUpdateRender(
    //                     [JSON.parse(JSON.stringify(latexElement.value))],
    //                     true
    //                 );

    //                 latexElement.value = undefined;
    //             };
    //             image.src = src;
    //         }
    //     } else {
    //         const image = new Image();
    //         image.onload = () => {
    //             const element = createLatexElement(
    //                 image.width,
    //                 image.height,
    //                 md5,
    //                 latex
    //             );
    //             instance?.value.command.executeAddRender([element]);
    //         };
    //         image.src = src;
    //     }
    // }
};
</script>

<style lang="scss" scoped>
.ppt-tool-btn {
    &.active {
        border-color: #ccc;
        background-color: #ececec;
    }
}

.shape-pool {
    width: 280px;
    outline: 0;
    .category {
        .category-name {
            font-size: 12px;
            margin-top: 5px;
        }
    }
    .shape-list {
        display: flex;
        flex-wrap: wrap;
    }
    .shape-item {
        width: 28px;
        height: 28px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
            background-color: #f6f6f6;
        }
    }
}

.ppt-chart-item {
    display: flex;
    align-items: center;
    width: 120px;
    font-size: 12px;
    color: #555555;
    cursor: pointer;
    height: 32px;
    margin: 0 -16px;
    padding: 0 16px 0 12px;
    &:hover {
        background-color: #41464b0d;
    }
    .ppt-chart-text {
        margin-top: 2px;
    }
}

.ppt-chart-content {
    padding: 12px 16px;
    margin: -12px -16px;
    outline: 0;
}
</style>
