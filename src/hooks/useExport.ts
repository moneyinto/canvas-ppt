import Editor from "@/plugins/editor";
import { IMPPTXJSON } from "@/types";
import { encrypt } from "@/utils/crypto";
import { saveAs } from "file-saver";
import { Ref } from "vue";

export default (instance: Ref<Editor> | undefined, exporting: Ref<boolean>, exportPercent: Ref<number>) => {
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
                    mpptxJson.files[element.src] = await instance?.value.history.getFile(element.src) || "";
                }
            }
            exportPercent.value = (index + 1) / slides.length * 100 - 10;
        }
        setTimeout(() => {
            const blob = new Blob([encrypt(JSON.stringify(mpptxJson))], { type: "" });
            saveAs(blob, "mpptx_slides.mpptx");
            exporting.value = false;
        }, 500);
    };

    return {
        outputMPPTX
    };
};
