<template>
    <div class="footer-container">
        <div class="ppt-index-view">
            幻灯片 &nbsp; {{ total === 0 ? 0 : current + 1 }} / {{ total }}
        </div>
        <div class="ppt-zoom-control">
            <a-tooltip title="从当前页预览">
                <a-button class="ppt-zoom-btn" type="text" @click="preview()">
                    <SvgIcon name="preview" :size="20" />
                </a-button>
            </a-tooltip>
            <a-tooltip :title="fullScreen ? '退出全屏' : '进入全屏'">
                <a-button
                    class="ppt-zoom-btn"
                    type="text"
                    @click="switchFullScreen()"
                >
                    <SvgIcon
                        :name="fullScreen ? 'offScreen' : 'fullScreen'"
                        :size="20"
                    />
                </a-button>
            </a-tooltip>
            <a-divider style="margin-top: 1px" type="vertical" />
            <a-tooltip title="适合页面">
                <a-button class="ppt-zoom-btn" type="text" @click="fitZoom()">
                    <SvgIcon name="fit" :size="20" />
                </a-button>
            </a-tooltip>
            <a-tooltip :title="'缩小  ' + SHORTCUT.DECREASE">
                <a-button class="ppt-zoom-btn" type="text" @click="decrease()">
                    <SvgIcon name="minus" :size="20" />
                </a-button>
            </a-tooltip>
            <div class="ppt-zoom-view">{{ zoom }}%</div>
            <a-tooltip
                placement="topRight"
                :title="'放大  ' + SHORTCUT.INCREASE"
            >
                <a-button class="ppt-zoom-btn" type="text" @click="increase()">
                    <SvgIcon name="plus" :size="20" />
                </a-button>
            </a-tooltip>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, inject, Ref, watch, onMounted } from "vue";
import { SHORTCUT } from "@/config/shortcut";
import Editor from "@/plugins/editor";
import SvgIcon from "@/components/SvgIcon.vue";
import { enterFullScreen, exitFullScreen, isFullScreen } from "@/utils";

const props = defineProps({
    total: {
        type: Number,
        default: 0
    },
    current: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(["onZoomChange", "onPreview"]);

const instance = inject<Ref<Editor>>("instance");

const zoom = ref(100);
const fullScreen = ref(isFullScreen());

watch(instance!, () => {
    if (instance?.value) {
        zoom.value = Math.floor(instance.value.command.getZoom() * 100);
        emit("onZoomChange", zoom.value);

        instance.value.listener.onZoomChange = (newZoom) => {
            zoom.value = Math.floor(newZoom * 100);
            emit("onZoomChange", zoom.value);
        };
    }
});

const preview = () => {
    emit("onPreview", props.current);
};

const fitZoom = () => {
    instance?.value.command.executeFitZoom();
};

const decrease = () => {
    instance?.value.command.executeDecrease();
};

const increase = () => {
    instance?.value.command.executeIncrease();
};

onMounted(() => {
    document.addEventListener("fullscreenchange", () => {
        fullScreen.value = isFullScreen();
    });
});

const switchFullScreen = () => {
    if (fullScreen.value) {
        exitFullScreen();
    } else {
        enterFullScreen();
    }
};
</script>

<style lang="scss" scoped>
.footer-container {
    display: flex;
    justify-content: space-between;
}

.ppt-index-view {
    color: #555555;
    font-size: 12px;
    padding-left: 20px;
    display: flex;
    align-items: center;
}

.ppt-zoom-control {
    padding: 0 10px 0 30px;
    display: flex;
    align-items: center;
}

.ppt-zoom-btn {
    display: flex;
    align-items: center;
    padding: 4px 5px;
}

.ppt-zoom-view {
    font-size: 13px;
    margin: 0 8px;
}
</style>
