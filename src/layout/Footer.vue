<template>
    <div class="footer-container">
        <div class="ppt-zoom-control">
            <a-popover>
                <a-button class="ppt-zoom-btn" type="text" @click="decrease()"><Minus :strokeWidth="2" /></a-button>
                <template #content>
                    <div class="control-tooltip">
                        <div>缩小</div>
                        <div class="shortcut-view">{{ SHORTCUT.DECREASE }}</div>
                    </div>
                </template>
            </a-popover>
            <div class="ppt-zoom-view">
                {{ zoom }}%
            </div>
            <a-popover>
                <a-button class="ppt-zoom-btn" type="text" @click="increase()"><Plus :strokeWidth="2" /></a-button>
                <template #content>
                    <div class="control-tooltip">
                        <div>放大</div>
                        <div class="shortcut-view">{{ SHORTCUT.INCREASE }}</div>
                    </div>
                </template>
            </a-popover>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Plus, Minus } from "@icon-park/vue-next";
import { SHORTCUT } from "@/plugins/config/shortcut";
import Editor from "@/plugins/editor";

const props = defineProps({
    zoom: {
        type: Number,
        default: 1
    },
    instance: {
        type: Editor
    }
});

const zoom = computed(() => Math.floor(props.zoom * 100));

const decrease = () => {
    props.instance && props.instance.command.executeDecrease();
};

const increase = () => {
    props.instance && props.instance.command.executeIncrease();
};
</script>

<style lang="scss" scoped>
.footer-container {
    display: flex;
    justify-content: flex-end;
}

.ppt-zoom-control {
    padding: 0 10px 0 30px;
    display: flex;
    align-items: center;
}

.ppt-zoom-btn {
    font-size: 18px;
    color: #000;
}

.control-tooltip {
    text-align: center;
}

.shortcut-view {
    font-size: 12px;
    white-space: nowrap;
}

.ppt-zoom-view {
    font-size: 13px;
}
</style>
