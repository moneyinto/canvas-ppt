<template>
    <ul class="menu-content">
        <template v-for="menu in menus" :key="menu.text">
            <li
                v-if="!menu.hide"
                class="menu-item"
                @click.stop="handleClickMenuItem(menu)"
                :class="{ divider: menu.divider, disable: menu.disable }"
            >
                <div
                    class="menu-item-content"
                    :class="{
                        'has-children': menu.children,
                        'has-handler': menu.handler
                    }"
                    v-if="!menu.divider"
                >
                    <div class="menu-icon-box">
                        <SvgIcon v-if="menu.icon" :name="menu.icon" :size="28" />
                    </div>
                    <span class="menu-text">{{ menu.text }}</span>
                    <span
                        class="menu-sub-text"
                        v-if="menu.subText && !menu.children"
                    >
                        {{ menu.subText }}
                    </span>

                    <menu-content
                        class="sub-menu"
                        :menus="menu.children"
                        v-if="menu.children && menu.children.length"
                        :handleClickMenuItem="handleClickMenuItem"
                    />
                </div>
            </li>
        </template>
    </ul>
</template>

<script lang="ts" setup>
import { IContextmenuItem } from "@/types/contextmenu";
import { PropType, toRefs } from "vue";
import SvgIcon from "@/components/SvgIcon.vue";

const props = defineProps({
    menus: {
        type: Array as PropType<IContextmenuItem[]>,
        required: true
    },
    handleClickMenuItem: {
        type: Function,
        required: true
    }
});

toRefs(props);
</script>

<style lang="scss" scoped>
$menuWidth: 170px;
$menuHeight: 32px;

.menu-content {
    width: $menuWidth;
    padding: 5px 0;
    background: #fff;
    border: 1px solid #eee;
    box-shadow: rgb(0 0 0 / 8%) 0px 1px 4px;
    border-radius: 2px;
    list-style: none;
    margin: 0;
}
.menu-item {
    padding: 0 20px 0 12px;
    color: #555555;
    font-size: 12px;
    transition: all  0.1s;
    white-space: nowrap;
    height: $menuHeight;
    line-height: $menuHeight;
    background-color: #fff;
    cursor: pointer;

    .menu-icon-box {
        width: 28px;
        display: flex;
        align-items: center;
        margin-right: 4px;
    }

    .menu-text {
        flex: 1;
        min-width: 0;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    &:not(.disable):hover > .menu-item-content > .sub-menu {
        display: block;
    }

    &:not(.disable):hover > .has-children.has-handler::after {
        transform: scale(1);
    }

    &:hover:not(.disable) {
        background-color: #41464b0d;
    }

    &.divider {
        height: 1px;
        overflow: hidden;
        margin: 5px;
        background-color: #e5e5e5;
        line-height: 0;
        padding: 0;
    }

    &.disable {
        color: #b1b1b1;
        cursor: no-drop;
        .ppt-icon {
            opacity: 0.4;
        }
    }
}
.menu-item-content {
    display: flex;
    align-items: center;
    position: relative;

    &.has-children::before {
        content: "";
        display: inline-block;
        width: 6px;
        height: 6px;
        border-width: 3px;
        border-style: solid;
        border-color: #333 #333 transparent transparent;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%) rotate(45deg);
    }
    &.has-children.has-handler::after {
        content: "";
        display: inline-block;
        width: 1px;
        height: 24px;
        background-color: #f1f1f1;
        position: absolute;
        right: 18px;
        top: 3px;
        transform: scale(0);
        transition: transform 0.2s;
    }

    .menu-sub-text {
        opacity: 0.6;
    }
    .sub-menu {
        width: $menuWidth;
        position: absolute;
        display: none;
        left: 112%;
        top: -6px;
    }
}
</style>
