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
import emitter, { EmitterEvents } from "@/utils/emitter";
import { OPTION_TYPE } from "@/plugins/config/options";

export default (
    instance: Ref<Editor | undefined>,
    viewSlides: Ref<ISlide[]>,
    historyCursor: Ref<number>,
    historyLength: Ref<number>
) => {
    const slideIndex = ref(0);
    const selectedSlideId = ref("");

    const initSlide = async () => {
        // 获取历史记录的数据进行展示
        if (instance.value) {
            viewSlides.value = await instance.value.history.getHistorySnapshot();
            instance.value.stageConfig.setSildes(viewSlides.value);
            historyCursor.value = instance.value.history.cursor;
            historyLength.value = historyCursor.value + 1;
        }

        if (viewSlides.value.length > 0) {
            selectedSlideId.value = viewSlides.value[slideIndex.value].id;
            instance.value?.stageConfig.setSlideId(selectedSlideId.value);
            // 进行渲染
            instance.value?.command.executeRender();
            // 初始化时增加历史记录
            // instance.value?.history.add();
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

        instance.value?.history.add(OPTION_TYPE.DELETE_SLIDE);
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

            addPPT(slide, true);

            // 再次写入剪切板，为了下一次粘贴能够在上一次的基础上进行偏移
            await copyText(
                encrypt(
                    `${CLIPBOARD_STRING_TYPE.SLIDE}${JSON.stringify(slide)}`
                )
            );

            instance.value?.history.add(OPTION_TYPE.PASTE_SLIDE);
        }
    };

    const addPPT = (slide?: ISlide, noHistory?: boolean) => {
        slideIndex.value++;
        const id = createRandomCode();
        const newSlide = slide ? { ...slide, id } : { id, elements: [] };
        viewSlides.value.splice(slideIndex.value, 0, newSlide);
        onSelectedSlide(id);
        instance.value?.stageConfig.setSildes(viewSlides.value);
        if (!noHistory) instance.value?.history.add(OPTION_TYPE.ADD_EMPTY_SLIDE);
    };

    const onSelectedSlide = (id: string) => {
        slideIndex.value = viewSlides.value.findIndex(
            (slide) => slide.id === id
        );
        selectedSlideId.value = id;
        instance.value?.stageConfig.setSlideId(selectedSlideId.value);
        instance.value?.stageConfig.updateOperateElements([]);
        instance.value?.command.executeRender();

        emitter.emit(EmitterEvents.SHOW_PANELS, false);
        setTimeout(() => {
            emitter.emit(EmitterEvents.PANELS_TYPE, "");
        }, 300);
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
