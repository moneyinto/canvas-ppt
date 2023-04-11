<template>
    <div
        class="resize-pointer"
    ></div>
</template>

<style lang="scss" scoped>
.resize-pointer {
    position: absolute;
    z-index: 101;
    width: 10px;
    height: 10px;
    transform: translate(-5px, -5px);
    background-color: #000;
}
</style>
