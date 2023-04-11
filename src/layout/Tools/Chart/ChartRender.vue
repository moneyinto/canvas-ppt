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
import { PropType, computed, onMounted, ref } from "vue";

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
let chart;

const getOptions = () => {
    // const propsOptopns = props.options || {};
    const options = {
        xAxis: {
            type: "category",
            data: props.labels
        },
        yAxis: {
            type: "value"
        },
        series: [
            {
                data: props.series[0],
                type: "bar",
                showBackground: true,
                backgroundStyle: {
                    color: "rgba(180, 180, 180, 0.2)"
                }
            }
        ]
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
</script>

<style lang="scss" scoped>
.ppt-chart-content {
}
</style>
