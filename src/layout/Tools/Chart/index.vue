<template>
    <a-modal
        title="图表"
        width="80%"
        height="80%"
        okText="确认"
        cancelText="取消"
        class="ppt-chart-dialog"
        :visible="visible"
        @cancel="close"
        @ok="sure"
    >
        <div class="chart-hidden-box">
            <div class="chart-editor-content" tabindex="1" onkeydown.stop="">
                <table>
                    <tbody>
                        <tr
                            v-for="rowIndex in 31"
                            :key="rowIndex"
                            :class="{
                                'table-fixed-top': rowIndex === 1
                            }"
                        >
                            <td
                                v-for="colIndex in 27"
                                :key="colIndex"
                                :class="{
                                    'chart-table-blue': rowIndex === 2 || colIndex === 2,
                                    'no-top-border': rowIndex < 3,
                                    'no-left-border': colIndex < 3,
                                    'no-right-border': colIndex === 1 || colIndex === 27,
                                    'no-bottom-border': rowIndex === 1 || rowIndex === 31,
                                    'table-fixed-left': colIndex === 1
                                }"
                            >
                                <input
                                    :class="['item']"
                                    :type="rowIndex > 2 && colIndex > 2 ? 'number' : 'text'"
                                    v-if="rowIndex > 1 && colIndex > 1"
                                    :disabled="rowIndex === 2 && colIndex === 2"
                                    :id="`cell-${rowIndex - 1}-${colIndex - 1}`"
                                    autocomplete="off"
                                    @focus="
                                        focusCell = [rowIndex - 2, colIndex - 2]
                                    "
                                    @change="($event) => inputChange($event, rowIndex, colIndex)"
                                />
                                <div
                                    class="chart-table-td"
                                    :class="{
                                        'border-bottom': rowIndex === 1,
                                        'border-right': colIndex === 1
                                    }"
                                    v-else
                                >
                                    <span v-if="colIndex === 1 && rowIndex > 1">
                                        {{ rowIndex - 1 }}
                                    </span>
                                    <span
                                        v-else-if="
                                            colIndex > 1 && rowIndex === 1
                                        "
                                    >
                                        {{ String.fromCharCode(colIndex + 63) }}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="chart-render-box">
                <ChartRender
                    :type="type"
                    :width="chartSet.width"
                    :height="chartSet.height"
                    :labels="chartSet.labels"
                    :legends="chartSet.legends"
                    :series="chartSet.series"
                />
            </div>
        </div>
    </a-modal>
</template>

<script lang="ts" setup>
import { ChartData, ChartType, IPPTChartElement } from "@/types/element";
import { PropType, nextTick, ref, toRefs, watch } from "vue";
import ChartRender from "./ChartRender.vue";

const emit = defineEmits(["ok", "update:visible"]);

const baseChartData: ChartData = {
    labels: ["类别1", "类别2", "类别3", "类别4", "类别5"],
    legends: ["系列1"],
    series: [[12, 19, 5, 2, 18]]
};

const props = defineProps({
    type: {
        type: String as PropType<ChartType>,
        required: true
    },
    element: {
        type: Object as PropType<IPPTChartElement>
    },
    visible: {
        type: Boolean,
        required: true
    }
});

const { visible } = toRefs(props);

const focusCell = ref<[number, number] | null>(null);
const { labels, legends, series } = baseChartData;
const chartSet = ref({
    labels,
    legends,
    series,
    width: 400,
    height: 280
});

const initData = () => {
    const _data: string[][] = [];

    const rowCount = labels.length;
    const colCount = series.length;

    _data.push(["", ...legends]);
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const row = [labels[rowIndex]];
        for (let colIndex = 0; colIndex < colCount; colIndex++) {
            row.push(series[colIndex][rowIndex] + "");
        }
        _data.push(row);
    }

    for (let rowIndex = 0; rowIndex < rowCount + 1; rowIndex++) {
        for (let colIndex = 0; colIndex < colCount + 1; colIndex++) {
            const inputRef = document.querySelector(
                `#cell-${rowIndex + 1}-${colIndex + 1}`
            ) as HTMLInputElement;
            if (!inputRef) continue;
            inputRef.value = _data[rowIndex][colIndex] + "";
        }
    }
};

const inputChange = (event: Event, rowIndex: number, colIndex: number) => {
    const value = (event.target as any).value;
    if (rowIndex === 2) {
        legends[colIndex - 3] = value;
    } else if (colIndex === 2) {
        labels[rowIndex - 3] = value;
    } else {
        series[colIndex - 3][rowIndex - 3] = Number(value);
    }
};

watch(
    () => props.visible,
    () => {
        if (props.visible) {
            if (props.element) {
                chartSet.value.labels = props.element.data.labels;
                chartSet.value.legends = props.element.data.legends;
                chartSet.value.series = props.element.data.series;
            }
            nextTick(initData);
        } else {
            // clear
        }
    }
);

const close = () => {
    emit("update:visible", false);
};

const sure = () => {
    console.log(labels, legends, series);
    emit("ok");
};
</script>

<style lang="scss">
.ppt-chart-dialog {
    padding-bottom: 0 !important;
    top: 10% !important;
    .ant-modal-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        .ant-modal-body {
            flex: 1;
            min-height: 0;
            overflow: hidden;
        }
    }
}

.chart-hidden-box {
    width: 100%;
    height: 100%;
    overflow: hidden;
    outline: 1px solid #ccc;
}

.chart-editor-content {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;
    table {
        width: 100%;
        height: 100%;
        user-select: none;
        table-layout: fixed;
        border-collapse: collapse;
        border-spacing: 0;
        // margin: -1px;
        td {
            text-align: center;
            border: 1px solid #ccc;
            vertical-align: middle;
            width: 100px;
            height: 32px;
            overflow: hidden;
            padding: 0;
        }
        .item {
            width: 100%;
            height: 100%;
            border: 0;
            outline: 0;
            font-size: 13px;
            text-align: center;
            background-color: transparent;
        }
        td.no-right-border {
            border-right: 0;
        }
        td.no-bottom-border {
            border-bottom: 0;
        }
        td.no-top-border {
            border-top: 0;
        }
        td.no-left-border {
            border-left: 0;
        }
    }
    input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type=number] {
        appearance: textfield;
    }
}

.chart-table-td {
    background-color: #f7f7f7;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 13px;
    // margin: -2px -1px 0;
    &.border-bottom {
        border-bottom: 1px solid #ccc;
    }
    &.border-right {
        border-right: 1px solid #ccc;
    }
}

.chart-table-blue {
    background-color: rgba(200, 200, 200, 0.3);
}

.table-fixed-top {
    position: sticky;
    top: 0;
    z-index: 1;
}

.table-fixed-left {
    position: sticky;
    left: 0;
}

.chart-render-box {
    position: absolute;
    top: 100px;
    left: 400px;
    background-color: #ffffff;
    z-index: 100;
    border: 1px solid #000;
}
</style>
