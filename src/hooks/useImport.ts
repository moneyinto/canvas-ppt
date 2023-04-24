import { OPTION_TYPE } from "@/plugins/config/options";
import Editor from "@/plugins/editor";
import { decrypt } from "@/utils/crypto";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { Ref } from "vue";

export default (instance: Ref<Editor> | undefined, importing: Ref<boolean>, importPercent: Ref<number>) => {
    const importMPPTX = async (file: File) => {
        importing.value = true;
        importPercent.value = 10;
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async () => {
            importPercent.value = 30;
            const mpptxJson = JSON.parse(decrypt(reader.result as string));
            const slides = mpptxJson.slides;
            await instance?.value.history.clear();
            importPercent.value = 50;
            for (const key in mpptxJson.files) {
                await instance?.value.history.saveFile(key, mpptxJson.files[key]);
            }
            importPercent.value = 80;
            instance?.value.stageConfig.setSlides(slides);
            await instance?.value.history.add(OPTION_TYPE.INIT_DB_SLIDE);
            emitter.emit(EmitterEvents.INIT_SLIDE);
            importing.value = false;
        };
    };

    const importPPTX = async (file: File) => {
        console.log("importPPTX");
    };

    return {
        importMPPTX,
        importPPTX
    };
};
