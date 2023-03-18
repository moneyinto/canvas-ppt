<template>
    <div class="file-input-container" @click="openFileInput">
        <input type="file" :accept="accept" class="file-input" ref="inputRef" @change="onInputChange" />
        <slot />
    </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from "vue";

const props = defineProps({
    accept: {
        type: String,
        default: ""
    }
});

const { accept } = toRefs(props);

const emit = defineEmits(["change"]);

const inputRef = ref<HTMLInputElement>();
const openFileInput = () => {
    inputRef.value?.click();
};

const onInputChange = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files) emit("change", files);
};
</script>

<style lang="scss" scoped>
.file-input-container {
    position: relative;
    overflow: hidden;
    .file-input {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
    }
}
</style>
