<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="插入图片">
            <FileInput
                class="ppt-tool-btn"
                accept="image/*"
                @change="insertImageElement"
            >
                <PPTIcon icon="image" :size="28" />
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
                <ShapePool @selectShape="insertShapeElement" />
            </template>
        </a-popover>

        <a-tooltip title="插入文字">
            <div
                class="ppt-tool-btn"
                :class="insertTextActive && 'active'"
                @click="insertTextElement()"
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
                    <div
                        class="ppt-chart-item"
                        @click="
                            openChart({ args: 'bar', transformation: true })
                        "
                    >
                        <PPTIcon icon="bar_h" :size="28" />
                        <div class="ppt-chart-text">条形图</div>
                    </div>
                    <div
                        class="ppt-chart-item"
                        @click="openChart({ args: 'bar' })"
                    >
                        <PPTIcon icon="bar_v" :size="28" />
                        <div class="ppt-chart-text">柱状图</div>
                    </div>
                    <div
                        class="ppt-chart-item"
                        @click="openChart({ args: 'line' })"
                    >
                        <PPTIcon icon="line" :size="28" />
                        <div class="ppt-chart-text">折线图</div>
                    </div>
                    <div
                        class="ppt-chart-item"
                        @click="openChart({ args: 'pie' })"
                    >
                        <PPTIcon icon="pie" :size="28" />
                        <div class="ppt-chart-text">饼状图</div>
                    </div>
                    <div
                        class="ppt-chart-item"
                        @click="openChart({ args: 'funnel' })"
                    >
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
            :axisTransformation="axisTransformation"
            @ok="insertOrUpdateChart"
        />

        <a-tooltip title="插入视频">
            <FileInput
                class="ppt-tool-btn"
                accept="video/*"
                @change="insertVideoElement"
            >
                <PPTIcon icon="video" :size="28" />
            </FileInput>
        </a-tooltip>

        <a-tooltip title="插入音频">
            <FileInput
                class="ppt-tool-btn"
                style="padding: 0 8px"
                accept="audio/*"
                @change="insertAudioElement"
            >
                <PPTIcon icon="audio" :size="16" />
            </FileInput>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import Editor from "@/plugins/editor";
import FileInput from "@/components/FileInput.vue";
import Latex from "./Latex/index.vue";
import Chart from "./Chart/index.vue";
import PPTIcon from "@/components/Icon.vue";
import ShapePool from "@/components/ShapePool.vue";
import { inject, onMounted, onUnmounted, ref, Ref, watch } from "vue";
import {
    IPPTChartElement,
    IPPTLatexElement,
    ChartType,
    ChartData
} from "@/types/element";
import { fileMd5, dataURLtoFile } from "@/utils";
import {
    createLatexElement,
    createChartElement
} from "@/utils/create";
import emitter, { EmitterEvents } from "@/utils/emitter";
import useInsertElement from "@/hooks/useInsertElement";

const showShapePool = ref(false);
const hoverShapePool = ref(false);
const showChartPool = ref(false);
const hoverChartPool = ref(false);
const showLatex = ref(false);
const showChart = ref(false);

const insertTextActive = ref(false);

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

const {
    insertImageElement,
    insertShapeElement,
    insertTextElement,
    insertVideoElement,
    insertAudioElement
} = useInsertElement(instance, showShapePool);

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

const chartType = ref<ChartType>("bar");
const axisTransformation = ref<boolean>(false);
const openChart = ({
    args,
    transformation
}: {
    args: ChartType | IPPTChartElement;
    transformation?: boolean;
}) => {
    if (typeof args === "string") {
        const type = args as ChartType;
        chartElement.value = undefined;
        chartType.value = type;
        axisTransformation.value = !!transformation;
    } else {
        chartElement.value = args as IPPTChartElement;
        chartType.value = chartElement.value.chartType;
        axisTransformation.value = !!chartElement.value.axisTransformation;
    }

    showChart.value = true;
    showChartPool.value = false;
};

const insertOrUpdateChart = async ({
    data,
    axisTransformation,
    src,
    title,
    stack
}: {
    data: ChartData;
    axisTransformation: boolean;
    src: string;
    title: string;
    stack: boolean;
}) => {
    showChart.value = false;
    const file = dataURLtoFile(src, "chart.png", "image/png");
    const md5 = await fileMd5(file);
    if (md5) {
        await instance?.value.history.saveFile(md5, src);
        if (chartElement.value) {
            const image = new Image();
            image.onload = () => {
                chartElement.value!.data = data;
                chartElement.value!.src = md5;
                chartElement.value!.axisTransformation = axisTransformation;
                chartElement.value!.width = image.width / 3;
                chartElement.value!.height = image.height / 3;
                chartElement.value!.title = title;
                chartElement.value!.stack = stack;
                instance?.value.command.executeUpdateRender(
                    [JSON.parse(JSON.stringify(chartElement.value))],
                    true
                );

                chartElement.value = undefined;
            };
            image.src = src;
        } else {
            const image = new Image();
            image.onload = () => {
                const element = createChartElement(
                    chartType.value,
                    image.width / 3,
                    image.height / 3,
                    md5,
                    data,
                    axisTransformation,
                    title,
                    stack
                );
                instance?.value.command.executeAddRender([element]);
            };
            image.src = src;
        }
    }
};
</script>

<style lang="scss" scoped>
.ppt-tool-btn {
    &.active {
        border-color: #ccc;
        background-color: #ececec;
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
