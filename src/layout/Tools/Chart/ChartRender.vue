<template>
    <div
        class="ppt-chart-content"
        ref="chartRef"
        :style="{
            width: width + 'px',
            height: height + 'px'
        }"
    ></div>
</template>

<script lang="ts" setup>
import { ChartType } from "@/types/element";
import * as echarts from "echarts";
import { PropType, onMounted, ref, watch } from "vue";
type EChartsOption = echarts.EChartsOption;
type ECXAXis = echarts.XAXisComponentOption;
type ECXYXis = echarts.YAXisComponentOption;
type ECPieData = { value: number; name: string };

const props = defineProps({
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    type: {
        type: String as PropType<ChartType>,
        required: true
    },
    axisTransformation: {
        type: Boolean,
        required: true
    },
    labels: {
        type: Array as PropType<string[]>,
        required: true
    },
    legends: {
        type: Array as PropType<string[]>,
        required: true
    },
    series: {
        type: Array as PropType<number[][]>,
        required: true
    },
    legend: {
        type: String as PropType<"" | "top" | "bottom">
    },
    title: {
        type: String
    }
});

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | undefined;

const getOptions = () => {
    const xAxis: ECXAXis & ECXYXis = {
        type: "category",
        data: props.labels
    };

    const yAxis: ECXAXis & ECXYXis = {
        type: "value",
        splitLine: {
            show: true,
            lineStyle: {
                type: "dashed"
            }
        }
    };

    const series: echarts.SeriesOption[] = [];
    if (props.series.length > 0) {
        if (props.type === "pie" || props.type === "funnel") {
            const pieData: ECPieData[] = [];
            props.labels.forEach((label, index) => {
                pieData.push({
                    name: label,
                    value: props.series[0][index] as number
                });
            });

            series.push({
                data: pieData,
                type: props.type
            });
        } else {
            props.series.forEach((data, index) => {
                const name = props.legends[index];
                series.push({
                    name,
                    data,
                    type: props.type
                });
            });
        }
    }

    const options: EChartsOption = {
        ...props.title ? { title: { text: props.title } } : {},
        grid: {
            left: 20,
            right: 20,
            top: props.legend === "top" ? 40 : 20,
            bottom: props.legend === "bottom" ? 40 : 20,
            containLabel: true
        },
        series,
        ...(props.legend
            ? {
                  legend: {
                      ...(props.type === "pie" || props.type === "funnel"
                          ? {}
                          : { data: props.legends }),
                      top: props.legend
                  }
              }
            : {}),
        ...(props.type === "pie" || props.type === "funnel"
            ? {}
            : {
                  xAxis: props.axisTransformation ? yAxis : xAxis,
                  yAxis: props.axisTransformation ? xAxis : yAxis
              })
    };
    return options;
};

const renderChart = () => {
    if (!chartRef.value) return;

    chart = echarts.init(chartRef.value);
    const options = getOptions();
    chart.setOption(options);
};

onMounted(renderChart);

const updateChart = () => {
    if (!chart) {
        renderChart();
        return;
    }
    const options = getOptions();
    chart.setOption(options);
    chart.resize();
};

watch([() => props.width, () => props.height], () => {
    if (chart) chart.resize();
});

watch(
    [
        () => props.type,
        () => props.axisTransformation,
        () => props.labels,
        () => props.legends,
        () => props.series,
        () => props.legend,
        () => props.title
    ],
    updateChart,
    {
        deep: true
    }
);

const getChartImage = () => {
    return chart?.getDataURL();
};

defineExpose({ getChartImage });
</script>

<style lang="scss" scoped>
.ppt-chart-content {
}
</style>
