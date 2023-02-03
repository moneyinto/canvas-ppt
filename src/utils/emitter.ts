import mitt, { Emitter } from "mitt";
import { ISlide } from "@/plugins/types/slide";

export const enum EmitterEvents {
    UPDATE_THUMBNAIL = "UPDATE_THUMBNAIL",
    ADD_EMPTY_SLIDE = "ADD_EMPTY_SLIDE"
}

type Events = {
    [EmitterEvents.UPDATE_THUMBNAIL]: string;
    [EmitterEvents.ADD_EMPTY_SLIDE]: ISlide | undefined;
};

const emitter: Emitter<Events> = mitt<Events>();

export default emitter;
