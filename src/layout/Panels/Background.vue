<template>
    <div class="ppt-background-panel">
        <div class="ppt-panel-header">
            <div class="ppt-panel-title">
                <SvgIcon name="background" :size="32" />
                背景设置
            </div>
            <SvgIcon
                class="ppt-close-btn"
                @click="closePanel()"
                name="close"
                :size="18"
            />
        </div>
        <div class="ppt-panel-content">
            <div class="ppt-panel-label">背景</div>
            <a-select
                class="ppt-panel-line"
                v-model:value="backgroundType"
                @change="setBackgroundType()"
            >
                <a-select-option value="">无填充</a-select-option>
                <a-select-option value="solid">纯色填充</a-select-option>
                <a-select-option value="image">图片填充</a-select-option>
                <a-select-option value="gradient">渐变填充</a-select-option>
            </a-select>

            <div class="ppt-panel-flex" v-if="backgroundType === 'solid'">
                <div class="ppt-panel-label">颜色</div>

                <a-popover trigger="click" v-model:visible="showColorPopover">
                    <div class="ppt-background-color">
                        <div
                            class="ppt-background-view"
                            :style="{ background: currentColor }"
                        ></div>
                    </div>
                    <template #content>
                        <ColorBoard
                            :color="currentColor"
                            @change="onChangeColor"
                        />
                    </template>
                </a-popover>
            </div>

            <div class="ppt-line-space" v-if="backgroundType === 'image'"></div>
            <div class="ppt-panel-label" v-if="backgroundType === 'image'">
                图片
            </div>
            <FileInput
                v-if="backgroundType === 'image'"
                @change="(files: File[]) => uploadBackgroundImage(files)"
            >
                <div class="ppt-background-image">
                    <div
                        class="content"
                        :style="{ backgroundImage: `url(${backgroundImage})` }"
                    >
                        <SvgIcon name="plus" :size="24" />
                    </div>
                </div>
            </FileInput>

            <div class="ppt-line-space" v-if="backgroundType === 'image'"></div>
            <div class="ppt-panel-label" v-if="backgroundType === 'image'">
                填充方式
            </div>
            <a-select
                class="ppt-panel-line"
                v-model:value="imageSize"
                @change="setImageSize()"
                v-if="backgroundType === 'image'"
            >
                <a-select-option value="cover">拉伸</a-select-option>
                <a-select-option value="repeat">平铺</a-select-option>
            </a-select>

            <div
                class="ppt-line-space"
                v-if="backgroundType === 'gradient'"
            ></div>
            <div class="ppt-panel-label" v-if="backgroundType === 'gradient'">
                渐变方式
            </div>
            <a-select
                class="ppt-panel-line"
                v-model:value="gradientType"
                @change="setGradientType()"
                v-if="backgroundType === 'gradient'"
            >
                <a-select-option value="linear">线性渐变</a-select-option>
                <a-select-option value="radial">径向渐变</a-select-option>
            </a-select>

            <div class="ppt-gradient-flex" v-if="backgroundType === 'gradient'">
                <div
                    class="ppt-gradient-color"
                    :class="currentGradientIndex === index && 'active'"
                    v-for="(color, index) in gradientColor"
                    :key="color.value"
                    @click="selectGradientColor(index)"
                >
                    <div
                        class="ppt-gradient-view"
                        :style="{ background: color.value }"
                    ></div>
                </div>

                <div class="ppt-gradient-color" @click="addGradient">
                    <SvgIcon name="plus" />
                </div>

                <div class="ppt-gradient-color" @click="reduceGradient">
                    <SvgIcon name="minus" />
                </div>
            </div>

            <div class="ppt-panel-flex" v-if="backgroundType === 'gradient'">
                <div class="ppt-panel-label">渐变颜色</div>

                <a-popover
                    trigger="click"
                    v-model:visible="showGradientColorPopover"
                >
                    <div class="ppt-background-color">
                        <div
                            class="ppt-background-view"
                            :style="{ background: currentGradientColor }"
                        ></div>
                    </div>
                    <template #content>
                        <ColorBoard
                            :color="currentGradientColor"
                            @change="onGradientChangeColor"
                        />
                    </template>
                </a-popover>
            </div>

            <div class="ppt-panel-flex" v-if="backgroundType === 'gradient'">
                <div class="ppt-panel-label">渐变位置</div>

                <a-slider
                    class="ppt-rotate-slider"
                    v-model:value="currentGradientOffset"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    @change="onGradientOffsetChange"
                />
            </div>

            <div
                class="ppt-panel-flex"
                v-if="
                    backgroundType === 'gradient' && gradientType === 'linear'
                "
            >
                <div class="ppt-panel-label">渐变角度</div>

                <a-slider
                    class="ppt-rotate-slider"
                    v-model:value="gradientRotate"
                    :min="0"
                    :max="360"
                    @change="onGradientRotateChange"
                />
            </div>
        </div>

        <a-button class="ppt-apply-btn" @click="applyAll()">
            应用到全部
        </a-button>
    </div>
</template>

<script lang="ts" setup>
import { inject, ref, Ref, watch } from "vue";
import ColorBoard from "@/components/ColorBoard.vue";
import FileInput from "@/components/FileInput.vue";
import SvgIcon from "@/components/SvgIcon.vue";
import Editor from "@/plugins/editor";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { ISlideBackground } from "@/types/slide";
import { deepClone, fileMd5 } from "@/utils";
import { IGradientColor } from "@/types";
import { THEME_COLOR } from "@/config/stage";
import { message } from "ant-design-vue";

const backgroundType = ref("");
const currentColor = ref("#ffffff");
const gradientColor = ref<IGradientColor[]>([]);
const backgroundImage = ref("");
const backgroundImageId = ref("");
const imageSize = ref<"cover" | "repeat">("cover");
const gradientType = ref<"linear" | "radial">("linear");
const gradientRotate = ref(0);
const showColorPopover = ref(false);
const showGradientColorPopover = ref(false);
const currentGradientOffset = ref(0);
const currentGradientColor = ref("");
const currentGradientIndex = ref(0);
const instance = inject<Ref<Editor>>("instance");

const defaultGradientColor: IGradientColor[] = [
    {
        offset: 0,
        value: "#ffffff"
    },
    {
        offset: 1,
        value: THEME_COLOR
    }
];

const init = async () => {
    if (instance?.value) {
        const currentSlide = instance.value.stageConfig.getCurrentSlide();
        const background = currentSlide?.background;
        if (background) {
            backgroundType.value = background.type;
            currentColor.value = background.color || "#ffffff";
            imageSize.value = background.imageSize || "cover";
            gradientType.value = background.gradientType || "linear";
            gradientRotate.value = background.gradientRotate || 0;
            gradientColor.value = background.gradientColor || defaultGradientColor;
            currentGradientIndex.value = 0;
            currentGradientColor.value = gradientColor.value[0].value;
            currentGradientOffset.value = gradientColor.value[0].offset;
            backgroundImageId.value = background.image || "";
            backgroundImage.value = await instance.value.history.getFile(
                backgroundImageId.value
            );
        }
    }
};

init();

watch(instance!, init);

const onChangeColor = (args: Parameters<(color: string) => void>) => {
    const [color] = args;
    if (color) {
        currentColor.value = color;
        instance?.value.command.executeSetBackground({
            type: "solid",
            color
        });
    }
    showColorPopover.value = false;
};

const setGradient = () => {
    instance?.value.command.executeSetBackground({
        type: "gradient",
        gradientType: gradientType.value,
        gradientColor: gradientColor.value,
        gradientRotate: gradientRotate.value
    });
};

const reduceGradient = () => {
    if (gradientColor.value.length > 2) {
        gradientColor.value.splice(currentGradientIndex.value, 1);
        const index = currentGradientIndex.value < gradientColor.value.length ? currentGradientIndex.value : (gradientColor.value.length - 1);
        selectGradientColor(index);
    } else {
        message.warning("至少保留两个!");
    }
};

const addGradient = () => {
    const lastIndex = gradientColor.value.length - 1;
    const lastGradientColor = deepClone(gradientColor.value[lastIndex]);
    const lastPrevGradientOffset = gradientColor.value[lastIndex - 1].offset;
    // 取两者中间值
    lastGradientColor.offset = Math.floor((lastGradientColor.offset * 100 + lastPrevGradientOffset * 100) / 2) / 100;
    gradientColor.value.splice(lastIndex, 0, lastGradientColor);
    selectGradientColor(lastIndex);
    setGradient();
};

const onGradientChangeColor = (args: Parameters<(color: string) => void>) => {
    const [color] = args;
    if (color) {
        currentGradientColor.value = color;
        gradientColor.value[currentGradientIndex.value].value = color;
        setGradient();
    }
    showGradientColorPopover.value = false;
};

const setBackgroundType = () => {
    const background = backgroundType.value ? ({ type: backgroundType.value } as ISlideBackground) : undefined;
    currentColor.value = "#ffffff";
    backgroundImage.value = "";
    gradientColor.value = defaultGradientColor;
    imageSize.value = "cover";
    gradientType.value = "linear";
    gradientRotate.value = 0;
    if (background?.type === "gradient") {
        background.gradientColor = gradientColor.value;
        background.gradientType = gradientType.value;
        background.gradientRotate = gradientRotate.value;
    }
    instance?.value.command.executeSetBackground(background);
};

const setImageSize = () => {
    instance?.value.command.executeSetBackground({
        type: "image",
        image: backgroundImageId.value,
        imageSize: imageSize.value
    });
};

const uploadBackgroundImage = async (files: File[]) => {
    const imageFile = files[0];
    if (!imageFile) return;
    const md5 = await fileMd5(imageFile);
    if (md5) {
        const reader = new FileReader();
        reader.addEventListener(
            "load",
            () => {
                const image = new Image();
                image.onload = () => {
                    backgroundImage.value = reader.result as string;
                    backgroundImageId.value = md5;

                    instance?.value.stageConfig.addCacheImage({
                        id: md5,
                        image
                    });

                    instance?.value.command.executeSetBackground({
                        type: "image",
                        image: md5
                    });

                    instance?.value.history.saveFile(
                        md5,
                        backgroundImage.value
                    );
                };
                image.src = reader.result as string;
            },
            false
        );
        reader.readAsDataURL(imageFile);
    }
};

const setGradientType = () => {
    setGradient();
};

const onGradientRotateChange = () => {
    setGradient();
};

const selectGradientColor = (i: number) => {
    currentGradientIndex.value = i;
    currentGradientColor.value = gradientColor.value[i].value;
    currentGradientOffset.value = gradientColor.value[i].offset;
};

const onGradientOffsetChange = () => {
    const i = currentGradientIndex.value;
    gradientColor.value[i].offset = currentGradientOffset.value;
    setGradient();
};

const applyAll = () => {
    instance?.value.command.executeApplyBackgroundAll();
};

const closePanel = () => {
    emitter.emit(EmitterEvents.SHOW_PANELS, false);
    setTimeout(() => {
        emitter.emit(EmitterEvents.PANELS_TYPE, "");
    }, 300);
};
</script>

<style lang="scss" scoped>
.ppt-background-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    .ppt-panel-header {
        height: 44px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        justify-content: space-between;
        border-bottom: 1px solid rgba(65, 70, 75, 0.1);
    }

    .ppt-panel-title {
        display: flex;
        align-items: center;
    }

    .ppt-close-btn {
        cursor: pointer;
    }

    .ppt-panel-content {
        padding: 10px 15px;
        flex: 1;
    }

    .ppt-panel-label {
        font-weight: bold;
        margin-right: 20px;
    }

    .ppt-panel-line {
        display: block;
        margin-top: 5px;
    }

    .ppt-panel-flex {
        margin-top: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .ppt-gradient-flex {
        margin-top: 15px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        margin-left: -5px;
    }

    .ppt-gradient-color {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1px solid #d9d9d9;
        background-color: #ffffff;
        cursor: pointer;
        margin-left: 5px;
        margin-bottom: 5px;
        &.active {
            border-color: #5b9bd5;
        }
    }

    .ppt-gradient-view {
        border: 1px dashed #d9d9d9;
        height: 22px;
        width: 22px;
    }

    .ppt-background-color {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        height: 32px;
        border: 1px solid #d9d9d9;
        background-color: #ffffff;
        cursor: pointer;
    }

    .ppt-background-view {
        border: 1px dashed #d9d9d9;
        height: 22px;
        width: calc(100% - 10px);
    }

    .ppt-background-image {
        margin-top: 5px;
        height: 130px;
        border: 1px dashed #d9d9d9;
        cursor: pointer;
        .content {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background-position: 50%;
            background-size: contain;
            background-repeat: no-repeat;
        }
    }

    .ppt-line-space {
        height: 15px;
    }

    .ppt-rotate-slider {
        flex: 1;
    }

    .ppt-apply-btn {
        margin: 20px;
    }
}
</style>
