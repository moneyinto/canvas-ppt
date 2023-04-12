<template>
    <div
        class="ppt-chart-content"
        ref="chartRef"
        :style="{
            width: width + 'px',
            height: chartHeight + 'px'
        }"
    ></div>
</template>

<script lang="ts" setup>
import { ChartType } from "@/types/element";
import * as echarts from "echarts";
import { PropType, computed, onMounted, ref, watch } from "vue";
type EChartsOption = echarts.EChartsOption;
type ECXAXis = echarts.XAXisComponentOption;
type ECXYXis = echarts.YAXisComponentOption;
type ECPieData = { value: number; name: string; };
type ECData = number[] | ECPieData[];

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
    }
});

console.log(props.type);

const chartHeight = computed(() => {
    if (props.legend) return props.height - 20;
    return props.height;
});

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | undefined;

const getOptions = () => {
    // const propsOptopns = props.options || {};
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

    let data: ECData = props.series[0];
    if (props.type === "pie" || props.type === "funnel") {
        const pieData: ECPieData[] = [];
        props.labels.forEach((label, index) => {
            pieData.push({
                name: label,
                value: data[index] as number
            });
        });

        data = pieData;
    }

    const options: EChartsOption = {
        grid: {
            left: 50,
            right: 50,
            top: 50,
            bottom: 50
        },
        series: [
            {
                data,
                type: props.type
            }
        ]
    };
    return {
        ...options,
        ...(props.type === "pie" || props.type === "funnel"
            ? {}
            : {
                  xAxis: props.axisTransformation ? yAxis : xAxis,
                  yAxis: props.axisTransformation ? xAxis : yAxis
              })
    };
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
        () => props.series
    ],
    updateChart,
    {
        deep: true
    }
);
</script>

<style lang="scss" scoped>
.ppt-chart-content {
}
</style>
