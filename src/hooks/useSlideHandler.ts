import { ref, Ref } from "vue";
import Editor from "@/plugins/editor";
import { ISlide } from "@/plugins/types/slide";
import { createRandomCode } from "@/utils/create";
import {
    CLIPBOARD_STRING_TYPE,
    copyText,
    pasteCustomClipboardString,
    readClipboard
} from "@/utils/clipboard";
import { encrypt } from "@/utils/crypto";

export default (
    instance: Ref<Editor | undefined>,
    viewSlides: Ref<ISlide[]>
) => {
    const slideIndex = ref(0);
    const selectedSlideId = ref("");

    const initSlide = () => {
        if (viewSlides.value.length > 0) {
            selectedSlideId.value = viewSlides.value[slideIndex.value].id;
            instance.value?.stageConfig.setSlideId(selectedSlideId.value);
            // 进行渲染
            instance.value?.command.executeRender();
            // 初始化时增加历史记录
            instance.value?.history.add();
        }
    };

    const deleteSlide = () => {
        // 执行页面删除
        if (viewSlides.value.length === 0) return;
        viewSlides.value.splice(slideIndex.value, 1);
        if (
            viewSlides.value.length === slideIndex.value &&
            viewSlides.value.length > 0
        ) {
            slideIndex.value--;
        }
        if (viewSlides.value.length === 0) {
            instance.value?.command.executeRender();
            return;
        }
        const slideId = viewSlides.value[slideIndex.value].id;
        if (slideId) onSelectedSlide(slideId);
    };

    const getCurrentSlide = () => {
        return viewSlides.value[slideIndex.value];
    };

    const cutSlide = async () => {
        await copySlide();
        await deleteSlide();
    };

    const copySlide = async () => {
        const slide = getCurrentSlide();
        // 选中元素时
        if (slide) {
            // 将元素json数据加密存入剪切板
            await copyText(
                encrypt(
                    `${CLIPBOARD_STRING_TYPE.SLIDE}${JSON.stringify(slide)}`
                )
            );
        }
    };

    const pasteSlide = async () => {
        const content = await readClipboard();
        const index = content.indexOf(CLIPBOARD_STRING_TYPE.SLIDE);
        if (index > -1) {
            // 粘贴的内容为页面
            const resultText = content.replace(CLIPBOARD_STRING_TYPE.SLIDE, "");
            const slide = pasteCustomClipboardString(resultText) as ISlide;

            addPPT(slide);

            // 再次写入剪切板，为了下一次粘贴能够在上一次的基础上进行偏移
            await copyText(
                encrypt(
                    `${CLIPBOARD_STRING_TYPE.SLIDE}${JSON.stringify(slide)}`
                )
            );
        }
    };

    const addPPT = (slide?: ISlide) => {
        slideIndex.value++;
        const id = createRandomCode();
        const newSlide = slide ? { ...slide, id } : { id, elements: [] };
        viewSlides.value.splice(slideIndex.value, 0, newSlide);
        onSelectedSlide(id);
        instance.value?.stageConfig.setSildes(viewSlides.value);
        instance.value?.history.add();
    };

    const onSelectedSlide = (id: string) => {
        slideIndex.value = viewSlides.value.findIndex(
            (slide) => slide.id === id
        );
        selectedSlideId.value = id;
        instance.value?.stageConfig.setSlideId(selectedSlideId.value);
        instance.value?.stageConfig.setOperateElement(null);
        instance.value?.command.executeRender();
    };

    const switchSlide = () => {
        if (
            slideIndex.value > -1 &&
            slideIndex.value < viewSlides.value.length
        ) {
            onSelectedSlide(viewSlides.value[slideIndex.value].id);
        }
    };

    return {
        slideIndex,
        selectedSlideId,
        initSlide,
        cutSlide,
        deleteSlide,
        copySlide,
        pasteSlide,
        addPPT,
        onSelectedSlide,
        switchSlide
    };
};
