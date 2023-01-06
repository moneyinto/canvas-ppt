<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="插入图片">
            <div class="ppt-tool-btn">
                <PPTIcon icon="image" :size="28" />
            </div>
        </a-tooltip>

        <a-popover trigger="click" v-model:visible="showShapePool">
            <a-tooltip title="插入形状" v-if="!showShapePool">
                <div class="ppt-tool-btn">
                    <PPTIcon icon="shape" :size="28" />
                    &nbsp;
                    <PPTIcon icon="down" :size="6" />
                    &nbsp;
                </div>
            </a-tooltip>
            <div class="ppt-tool-btn active" v-else>
                <PPTIcon icon="shape" :size="28" />
                &nbsp;
                <PPTIcon icon="down" :size="6" />
                &nbsp;
            </div>

            <template #content>
                <div class="shape-pool">
                    <div
                        class="category"
                        v-for="item in SHAPE_LIST"
                        :key="item.type"
                    >
                        <div class="category-name">{{ item.type }}</div>
                        <div class="shape-list">
                            <div
                                class="shape-item"
                                v-for="(shape, index) in item.children"
                                :key="index"
                                @click="selectShape(shape)"
                            >
                                <SvgWrapper
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
                                            fill="transparent"
                                            stroke="#999"
                                            stroke-width="1px"
                                            :d="shape.path"
                                        ></path>
                                    </g>
                                </SvgWrapper>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </a-popover>
    </div>
</template>

<script lang="ts" setup>
import SvgWrapper from "@/components/SvgWrapper.vue";
import { SHAPE_LIST } from "@/plugins/config/shapes";
import Editor from "@/plugins/editor";
import { IShapeItem } from "@/plugins/types/shape";
import { inject, ref, Ref } from "vue";

const showShapePool = ref(false);

const instance = inject<Ref<Editor>>("instance");

const selectShape = (shape: IShapeItem) => {
    showShapePool.value = false;
    instance?.value.stageConfig.setInsertElement({ type: "shape", data: shape });
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
    width: 320px;
    .category {
        .category-name {
            font-size: 12px;
            // margin-bottom: 5px;
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
