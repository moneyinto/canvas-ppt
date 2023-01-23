<template>
    <div class="ppt-edit-tools">
        <a-tooltip title="插入图片">
            <FileInput class="ppt-tool-btn" @change="insertImage">
                <PPTIcon icon="image" :size="28" />
            </FileInput>
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
                                        style="outline: 0;"
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
                                                :fill="!!shape.fill ? '#999' : 'transparent'"
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
    </div>
</template>

<script lang="ts" setup>
import SvgWrapper from "@/components/SvgWrapper.vue";
import Editor from "@/plugins/editor";
import FileInput from "@/components/FileInput.vue";
import { SHAPE_LIST } from "@/plugins/config/shapes";
import { ILineItem, IShapeItem } from "@/plugins/types/shape";
import { inject, ref, Ref } from "vue";
import { ICreatingType } from "@/plugins/types/element";
import { createImageElement } from "@/plugins/stage/create";

const showShapePool = ref(false);

const instance = inject<Ref<Editor>>("instance");

const selectShape = (type: ICreatingType, shape: IShapeItem | ILineItem) => {
    showShapePool.value = false;
    if (type === "line") {
        instance?.value.stageConfig.setInsertElement({ type, data: shape as ILineItem });
    } else if (type === "shape") {
        instance?.value.stageConfig.setInsertElement({ type, data: shape as IShapeItem });
    }
};

const insertImage = (files: File[]) => {
    const imageFile = files[0];
    if (!imageFile) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        const image = new Image();
        image.onload = () => {
            const element = createImageElement(image.width, image.height, reader.result as string);
            instance?.value.stageConfig.addElement(element);
            instance?.value.history.add();
            instance?.value.stageConfig.setOperateElement(element);
            instance?.value.stageConfig.resetCheckDrawOprate();
        };
        image.src = reader.result as string;
    }, false);
    reader.readAsDataURL(imageFile);
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
