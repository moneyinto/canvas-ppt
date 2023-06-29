import Editor from "@/plugins/editor";
import { ISlide } from "@/types/slide";
import { OPTION_TYPE } from "@/config/options";
import { ref, Ref } from "vue";

export default (
    instance: Ref<Editor | undefined>,
    viewSlides: Ref<ISlide[]>
) => {
    const sortTartIndex = ref(0);
    const sortIndex = ref(-1);
    const sortType = ref("");

    const onDragStart = (index: number) => {
        sortTartIndex.value = index;
        setTimeout(() => {
            // 延迟显示可拖拽区域，阻止拖拽拖不了的问题
            sortIndex.value = index;
        }, 100);
    };

    const onDragEnter = (index: number, type: string) => {
        sortType.value = type;
        sortIndex.value = index;
    };

    const onDragEnd = () => {
        sortIndex.value = -1;
        sortTartIndex.value = 0;
        sortType.value = "";
    };

    const onDrop = () => {
        if (sortIndex.value !== -1 && sortType.value) {
            if (
                (sortTartIndex.value === sortIndex.value + 1 && sortType.value === "bottom") ||
                (sortTartIndex.value === sortIndex.value)
            ) return onDragEnd();
            const targetSlide = viewSlides.value[sortTartIndex.value];
            viewSlides.value.splice(sortTartIndex.value, 1);
            const spliceIndex = sortIndex.value === 0 && sortType.value === "bottom" ? 1 : sortIndex.value;
            viewSlides.value.splice(spliceIndex, 0, targetSlide);
            instance.value?.stageConfig.setSlides(viewSlides.value);
            instance.value?.history.add(OPTION_TYPE.SORT_SLIDE);
            onDragEnd();
        }
    };

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
    };

    return {
        sortIndex,
        sortType,
        onDragStart,
        onDragEnter,
        onDragOver,
        onDragEnd,
        onDrop
    };
};
