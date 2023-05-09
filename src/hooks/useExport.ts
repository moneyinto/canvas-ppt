import Editor from "@/plugins/editor";
import { encrypt } from "@/utils/crypto";
import { addAudio, addImage, addLine, addShape, addText, addVideo } from "@/utils/export";
import { message } from "ant-design-vue";
import { saveAs } from "file-saver";
import Pptxgen from "pptxgenjs";
import JSZip from "jszip";
import { Ref } from "vue";

export default (
    instance: Ref<Editor> | undefined,
    exporting: Ref<boolean>,
    exportPercent: Ref<number>
) => {
    const addFileFileToFolder = async (zip: JSZip, fileName: string) => {
        const file = (await instance?.value.history.getFile(fileName)) || "";
        const regExp = /data:(.*?)\/(.*?);base64,/;
        const result = file.match(regExp);
        const ext = result ? result[2] : "";
        await zip.folder("files")?.file(`${fileName}.${ext}`, file.replace(regExp, ""), { base64: true });
    };

    const getMPPTXContent = async (zipType?: "blob" | "nodebuffer") => {
        const jszip = new JSZip();
        const slides = instance?.value.stageConfig.slides || [];
        const cacheFiles: string[] = [];
        for (const [index, slide] of slides.entries()) {
            if (slide.background && slide.background.type === "image" && slide.background.image) {
                if (!cacheFiles.includes(slide.background.image)) {
                    await addFileFileToFolder(jszip, slide.background.image);
                    cacheFiles.push(slide.background.image);
                }
            }

            for (const element of slide.elements) {
                if (
                    element.type === "image" ||
                    element.type === "chart" ||
                    element.type === "latex" ||
                    element.type === "video" ||
                    element.type === "audio"
                ) {
                    if (!cacheFiles.includes(element.src)) {
                        await addFileFileToFolder(jszip, element.src);
                        cacheFiles.push(element.src);
                    }
                }
            }
            exportPercent.value = ((index + 1) / slides.length) * 100 - 10;
        }
        jszip.file("mpptx.json", encrypt(JSON.stringify(slides)));
        const content = await jszip.generateAsync({
            type: zipType || "blob", // 压缩类型
            compression: "DEFLATE", // 压缩算法
            compressionOptions: { // 压缩级别
                level: 9
            }
        });
        return content;
    }

    const outputMPPTX = async () => {
        exporting.value = true;
        exportPercent.value = 0;
        const blob = await getMPPTXContent() as Blob;
        setTimeout(() => {
            saveAs(blob, "mpptx_slides.mpptx");
            exporting.value = false;
        }, 500);
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
                    // 不支持平铺
                } else if (background.type === "solid" && background.color) {
                    pptxSlide.background = {
                        color: background.color
                    };
                } else if (
                    background.type === "gradient" &&
                    background.gradientColor
                ) {
                    // 不支持渐变
                }
            }

            for (const element of slide.elements) {
                switch (element.type) {
                    case "text": {
                        addText(pptxSlide, element);
                        break;
                    }
                    case "shape": {
                        addShape(pptxSlide, element);
                        break;
                    }
                    case "latex":
                    case "chart":
                    case "image": {
                        const file = await instance?.value.history.getFile(element.src);
                        await addImage(pptxSlide, element, file || "");
                        break;
                    }
                    case "line": {
                        addLine(pptxSlide, element);
                        break;
                    }
                    case "video": {
                        const file = await instance?.value.history.getFile(element.src);
                        await addVideo(pptxSlide, element, file || "");
                        break;
                    }
                    case "audio": {
                        const file = await instance?.value.history.getFile(element.src);
                        await addAudio(pptxSlide, element, file || "");
                        break;
                    }
                }
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
        outputPPTX,
        getMPPTXContent
    };
};
