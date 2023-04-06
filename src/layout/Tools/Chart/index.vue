<template>
    <a-modal
        title="图表"
        width="80%"
        height="80%"
        okText="确认"
        cancelText="取消"
        class="ppt-chart-dialog"
        @ok="sure"
    >
        <div class="chart-editor-content">
            <table>
                <tbody>
                    <tr v-for="rowIndex in 31" :key="rowIndex">
                        <td
                            v-for="colIndex in 30"
                            :key="colIndex"
                        >
                            <input
                                :class="[
                                    'item'
                                ]"
                                :disabled="rowIndex === 1 && colIndex === 1"
                                :id="`cell-${rowIndex - 1}-${colIndex - 1}`"
                                autocomplete="off"
                                @focus="
                                    focusCell = [rowIndex - 1, colIndex - 1]
                                "
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </a-modal>
</template>

<script lang="ts" setup>
import { IPPTChartElement } from "@/types/element";
import { PropType, ref, toRefs } from "vue";

const emit = defineEmits(["ok"]);

const props = defineProps({
    element: {
        type: Object as PropType<IPPTChartElement>
    }
});

const { element } = toRefs(props);

const focusCell = ref<[number, number] | null>(null);

const sure = () => {
    emit("ok");
};
</script>

<style lang="scss">
.ppt-chart-dialog {
    padding-bottom: 0;
    top: 10%;
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
        td {
            text-align: center;
            border: 1px solid #ccc;
            vertical-align: middle;
            width: 100px;
            height: 32px;
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
    }
}
</style>
