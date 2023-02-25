import mitt, { Emitter } from "mitt";
import { ISlide } from "@/plugins/types/slide";

export const enum EmitterEvents {
    UPDATE_THUMBNAIL = "UPDATE_THUMBNAIL",
    ADD_EMPTY_SLIDE = "ADD_EMPTY_SLIDE",
    COPY_SLIDE = "COPY_SLIDE",
    CUT_SLIDE = "CUT_SLIDE",
    PASTE_SLIDE = "PASTE_SLIDE"
}

type Events = {
    [EmitterEvents.UPDATE_THUMBNAIL]: ISlide;
    [EmitterEvents.ADD_EMPTY_SLIDE]: ISlide | undefined;
    [EmitterEvents.COPY_SLIDE]: void;
    [EmitterEvents.CUT_SLIDE]: void;
    [EmitterEvents.PASTE_SLIDE]: void;
};

const emitter: Emitter<Events> = mitt<Events>();

export default emitter;
