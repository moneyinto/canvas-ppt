import { OPTION_TYPE } from "@/plugins/config/options";
import Editor from "@/plugins/editor";
import { decrypt } from "@/utils/crypto";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { Ref, createVNode, render } from "vue";
import AnalyzePPTX from "analyze-pptx";
import { dataURLtoFile, fileMd5 } from "@/utils";
import { ISlide } from "@/types/slide";
import ChartRender from "@/layout/Tools/Chart/ChartRender.vue";
import { IPPTChartElement } from "@/types/element";

export default (instance: Ref<Editor> | undefined, importing: Ref<boolean>, importPercent: Ref<number>) => {
    const importMPPTX = async (file: File) => {
        importing.value = true;
        importPercent.value = 10;
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async () => {
            importPercent.value = 30;
            const mpptxJson = JSON.parse(decrypt(reader.result as string));
            const slides: ISlide[] = mpptxJson.slides;
            await instance?.value.history.clear();
            importPercent.value = 50;
            for (const key in mpptxJson.files) {
                await instance?.value.history.saveFile(key, mpptxJson.files[key]);
            }
            importPercent.value = 80;
            instance?.value.stageConfig.setSlideId(slides.length > 0 ? slides[0].id : "");
            instance?.value.stageConfig.setSlides(slides);
            await instance?.value.history.add(OPTION_TYPE.INIT_DB_SLIDE);
            emitter.emit(EmitterEvents.INIT_SLIDE);
            importing.value = false;
        };
    };

    const dealFile = async (base64: string) => {
        const fileExt = base64.split(";")[0].split("/")[1];
        const file = dataURLtoFile(base64, "file", fileExt);
        const md5 = await fileMd5(file);
        await instance?.value.history.saveFile(md5, base64);
        return md5;
    };

    const getChartImage = (element: IPPTChartElement): Promise<string> => {
        return new Promise(resolve => {
            const container = document.createElement("div");
            const vm = createVNode(ChartRender, {
                type: element.chartType,
                axisTransformation: element.axisTransformation,
                width: element.width,
                height: element.height,
                labels: element.data.labels,
                legends: element.data.legends,
                series: element.data.series
            }, null);
            render(vm, container);
            setTimeout(() => {
                const chartBase64 = vm.component?.exposed?.getChartImage();
                container.remove();
                resolve(chartBase64);
            }, 1000);
        });
    };

    const importPPTX = async (file: File) => {
        importing.value = true;
        importPercent.value = 10;
        const analyzePPTX = new AnalyzePPTX();
        const slides = await analyzePPTX.read(file);
        await instance?.value.history.clear();
        importPercent.value = 50;
        for (const slide of slides) {
            if (slide.background && slide.background.image) {
                const base64 = slide.background.image;
                const md5 = await dealFile(base64);
                slide.background.image = md5;
            }

            for (const element of slide.elements) {
                if (element.type === "image") {
                    const base64 = element.src;
                    const md5 = await dealFile(base64);
                    element.src = md5;
                }

                if (element.type === "audio" || element.type === "video") {
                    const base64 = element.src;
                    const md5 = await dealFile(base64);
                    element.src = md5;
                    if (element.cover) {
                        const coverBase64 = element.cover;
                        const coverMd5 = await dealFile(coverBase64);
                        element.cover = coverMd5;
                    }
                }

                if (element.type === "chart") {
                    const base64 = await getChartImage(element);
                    const md5 = await dealFile(base64);
                    element.src = md5;
                }
            }
        }

        importPercent.value = 80;
        instance?.value.stageConfig.setSlideId(slides.length > 0 ? slides[0].id : "");
        instance?.value.stageConfig.setSlides(slides);
        await instance?.value.history.add(OPTION_TYPE.INIT_DB_SLIDE);
        emitter.emit(EmitterEvents.INIT_SLIDE);
        importing.value = false;
    };

    return {
        importMPPTX,
        importPPTX
    };
};
