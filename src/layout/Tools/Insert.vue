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

        <a-popover trigger="click" v-model:visible="showTablePool">
            <a-tooltip
                title="插入表格"
                :visible="!showTablePool && hoverTablePool"
            >
                <div
                    class="ppt-tool-btn"
                    @mouseover="hoverTablePool = true"
                    @mouseleave="hoverTablePool = false"
                >
                    <PPTIcon icon="table" :size="28" />
                    &nbsp;
                    <PPTIcon icon="down" :size="6" />
                    &nbsp;
                </div>
            </a-tooltip>

            <template #content>
                <div class="ppt-table-content">
                    <div class="ppt-table-title">{{ rowIndex }} x {{ colIndex }}</div>
                    <div @mouseout="onMouseOut">
                        <div class="ppt-table-line" v-for="row in 8" :key="row">
                            <div
                                class="ppt-table-td"
                                :class="
                                    rowIndex >= row && colIndex >= col && 'active'
                                "
                                v-for="col in 8"
                                :key="col"
                                @mouseenter="onMounseEnter(row, col)"
                                @click="insertTableElement(row, col)"
                            ></div>
                        </div>
                    </div>
                    <a-divider />
                    <div class="ppt-table-custom" @click="openCustomTable">自定义表格</div>
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

        <a-modal
            :visible="customTableVisible"
            title="自定义表格"
            width="300px"
            okText="确认"
            cancelText="取消"
            @cancel="closeCustomTable"
            @ok="sureAddTableElement"
        >
            <a-form
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
            >
                <a-form-item
                    label="行数："
                >
                    <a-input-number style="width: 100%;" v-model:value="rowIndex" />
                </a-form-item>
                <a-form-item
                    label="列数："
                >
                    <a-input-number style="width: 100%;" v-model:value="colIndex" />
                </a-form-item>
            </a-form>
        </a-modal>
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
import { createLatexElement, createChartElement } from "@/utils/create";
import emitter, { EmitterEvents } from "@/utils/emitter";
import useInsertElement from "@/hooks/useInsertElement";

const showShapePool = ref(false);
const hoverShapePool = ref(false);
const showChartPool = ref(false);
const hoverChartPool = ref(false);
const showLatex = ref(false);
const showChart = ref(false);
const showTablePool = ref(false);
const hoverTablePool = ref(false);

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
    insertAudioElement,
    insertTableElement
} = useInsertElement(instance, showShapePool, showTablePool);

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

const rowIndex = ref(0);
const colIndex = ref(0);
const customTableVisible = ref(false);

const onMounseEnter = (row: number, col: number) => {
    rowIndex.value = row;
    colIndex.value = col;
};

const onMouseOut = () => {
    rowIndex.value = 0;
    colIndex.value = 0;
};

const openCustomTable = () => {
    rowIndex.value = 5;
    colIndex.value = 5;
    customTableVisible.value = true;
    showTablePool.value = false;
};

const closeCustomTable = () => {
    customTableVisible.value = false;
    rowIndex.value = 0;
    colIndex.value = 0;
};

const sureAddTableElement = () => {
    customTableVisible.value = false;
    insertTableElement(rowIndex.value, colIndex.value);
    rowIndex.value = 0;
    colIndex.value = 0;
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

.ppt-table-content {
    width: 152px;
    .ppt-table-title {
        text-align: center;
        margin-bottom: 5px;
        color: #444;
        font-size: 12px;
    }
    .ppt-table-line {
        display: flex;
    }

    .ppt-table-td {
        width: 19px;
        height: 19px;
        position: relative;
        &:before {
            content: "";
            display: block;
            width: 16px;
            height: 16px;
            position: absolute;
            background-color: #f6f6f6;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-sizing: border-box;
        }
        &.active {
            &:before {
                background-color: #d1e8fe;
                border: 1px solid #5b9bd5;
            }
        }
    }
    .ant-divider {
        margin: 8px 0 3px;
    }
    .ppt-table-custom {
        font-size: 12px;
        color: #444;
        padding: 5px;
        cursor: pointer;
        &:hover {
            background-color: #f5f5f5;
        }
    }
}
</style>
