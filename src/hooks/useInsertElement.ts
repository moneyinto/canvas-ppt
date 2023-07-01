import { Ref } from "vue";
import Editor from "@/plugins/editor";
import { ICreatingType } from "@/types/element";
import { ILineItem, IShapeItem } from "@/types/shape";
import { fileMd5 } from "@/utils";
import {
    createAudioElement,
    createImageElement,
    createTableElement,
    createVideoElement
} from "@/utils/create";

export default (
    instance: Ref<Editor> | undefined,
    insertVisible: Ref<boolean>,
    tableVisible?: Ref<boolean>
) => {
    const insertShapeElement = (
        type: ICreatingType,
        shape: IShapeItem | ILineItem
    ) => {
        insertVisible.value = false;
        if (type === "line") {
            instance?.value.stageConfig.setInsertElement({
                type,
                data: shape as ILineItem
            });
        } else if (type === "shape") {
            instance?.value.stageConfig.setInsertElement({
                type,
                data: shape as IShapeItem
            });
        }
    };

    const insertImageElement = async (files: File[]) => {
        insertVisible.value = false;
        const imageFile = files[0];
        if (!imageFile) return;
        const md5 = await fileMd5(imageFile);
        if (md5) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                async () => {
                    await instance?.value.history.saveFile(
                        md5,
                        reader.result as string
                    );
                    const image = new Image();
                    image.onload = () => {
                        const element = createImageElement(
                            image.width,
                            image.height,
                            md5
                        );
                        window.cacheDomMap.set(md5, image);
                        instance?.value.command.executeAddRender([element]);
                    };
                    image.src = reader.result as string;
                },
                false
            );
            reader.readAsDataURL(imageFile);
        }
    };

    const insertTextElement = () => {
        insertVisible.value = false;
        instance?.value.stageConfig.setInsertElement({
            type: "text"
        });
    };

    const insertVideoElement = async (files: File[]) => {
        insertVisible.value = false;
        const videoFile = files[0];
        if (!videoFile) return;
        const md5 = await fileMd5(videoFile);
        if (md5) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                async () => {
                    await instance?.value.history.saveFile(
                        md5,
                        reader.result as string
                    );
                    const element = createVideoElement(
                        300,
                        200,
                        md5
                        // window.URL.createObjectURL(new Blob([reader.result as ArrayBuffer]))
                    );
                    instance?.value.command.executeAddRender([element]);
                },
                false
            );
            reader.readAsDataURL(videoFile);
            // reader.readAsArrayBuffer(videoFile);
        }
    };

    const insertAudioElement = async (files: File[]) => {
        insertVisible.value = false;
        const audioFile = files[0];
        if (!audioFile) return;
        const md5 = await fileMd5(audioFile);
        if (md5) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                async () => {
                    await instance?.value.history.saveFile(
                        md5,
                        reader.result as string
                    );
                    const element = createAudioElement(100, 100, md5);
                    instance?.value.command.executeAddRender([element]);
                },
                false
            );
            reader.readAsDataURL(audioFile);
        }
    };

    const insertTableElement = (row: number, col: number) => {
        if (!tableVisible) return;
        tableVisible.value = false;
        const element = createTableElement(row, col);
        instance?.value.command.executeAddRender([element]);
    };

    return {
        insertImageElement,
        insertShapeElement,
        insertTextElement,
        insertVideoElement,
        insertAudioElement,
        insertTableElement
    };
};
