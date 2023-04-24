import Editor from "@/plugins/editor";
import { IMPPTXJSON } from "@/types";
import { encrypt } from "@/utils/crypto";
import { message } from "ant-design-vue";
import { saveAs } from "file-saver";
import Pptxgen from "pptxgenjs";
import tinycolor from "tinycolor2";
import { Ref } from "vue";

export default (
    instance: Ref<Editor> | undefined,
    exporting: Ref<boolean>,
    exportPercent: Ref<number>
) => {
    const outputMPPTX = async () => {
        exporting.value = true;
        exportPercent.value = 0;
        const slides = instance?.value.stageConfig.slides || [];
        const mpptxJson: IMPPTXJSON = {
            files: {},
            slides
        };
        for (const [index, slide] of slides.entries()) {
            for (const element of slide.elements) {
                if (
                    element.type === "image" ||
                    element.type === "video" ||
                    element.type === "audio" ||
                    element.type === "chart" ||
                    element.type === "latex"
                ) {
                    mpptxJson.files[element.src] =
                        (await instance?.value.history.getFile(element.src)) ||
                        "";
                }
            }
            exportPercent.value = ((index + 1) / slides.length) * 100 - 10;
        }
        setTimeout(() => {
            const blob = new Blob([encrypt(JSON.stringify(mpptxJson))], {
                type: ""
            });
            saveAs(blob, "mpptx_slides.mpptx");
            exporting.value = false;
        }, 500);
    };

    const formatColor = (_color: string) => {
        const c = tinycolor(_color);
        const alpha = c.getAlpha();
        const color = alpha === 0 ? "#ffffff" : c.setAlpha(1).toHexString();
        return {
            alpha,
            color
        };
    };

    const outputPPTX = async () => {
        exporting.value = true;
        const pptx = new Pptxgen();
        pptx.layout = "LAYOUT_16x9";
        const slides = instance?.value.stageConfig.slides || [];
        for (const [index, slide] of slides.entries()) {
            const pptxSlide = pptx.addSlide();

            // 背景
            if (slide.background) {
                const background = slide.background;
                if (background.type === "image" && background.image) {
                    const file = await instance?.value.history.getFile(background.image);
                    pptxSlide.background = { data: file };
                } else if (background.type === "solid" && background.color) {
                    const c = formatColor(background.color);
                    pptxSlide.background = {
                        color: c.color,
                        transparency: (1 - c.alpha) * 100
                    };
                } else if (
                    background.type === "gradient" &&
                    background.gradientColor
                ) {
                    const [color1, color2] = background.gradientColor;
                    const color = tinycolor.mix(color1, color2).toHexString();
                    const c = formatColor(color);
                    pptxSlide.background = {
                        color: c.color,
                        transparency: (1 - c.alpha) * 100
                    };
                }
            }

            for (const element of slide.elements) {
                console.log(element);
            }

            exportPercent.value = ((index + 1) / slides.length) * 100 - 10;
        }

        setTimeout(() => {
            pptx.writeFile({ fileName: `demo_mpptx.pptx` })
                .then(() => (exporting.value = false))
                .catch(() => {
                    exporting.value = false;
                    message.error("导出失败");
                });
        }, 500);
    };

    return {
        outputMPPTX,
        outputPPTX
    };
};
