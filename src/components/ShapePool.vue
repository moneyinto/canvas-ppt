<template>
    <div class="shape-pool" @keydown.stop @click.stop tabindex="0">
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

<script lang="ts" setup>
import { SHAPE_LIST } from "@/plugins/config/shapes";
import SvgWrapper from "./SvgWrapper.vue";
import { ICreatingType } from "@/types/element";
import { ILineItem, IShapeItem } from "@/types/shape";

const emit = defineEmits(["selectShape"]);

const selectShape = (type: ICreatingType, shape: IShapeItem | ILineItem) => {
    emit("selectShape", type, shape);
};
</script>

<style lang="scss" scoped>
.shape-pool {
    width: 284px;
    outline: 0;
    background-color: #ffffff;
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
</style>
