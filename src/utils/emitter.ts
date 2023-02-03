import mitt, { Emitter } from "mitt";

export const enum EmitterEvents {
    UPDATE_THUMBNAIL = "UPDATE_THUMBNAIL"
}

type Events = {
    [EmitterEvents.UPDATE_THUMBNAIL]: string;
};

const emitter: Emitter<Events> = mitt<Events>();

export default emitter;
