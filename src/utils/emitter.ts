import mitt, { Emitter } from "mitt";
import { ISlide } from "@/types/slide";
import { PANELS } from "./panel";
import { ChartType, IPPTChartElement, IPPTLatexElement } from "@/types/element";

export const enum EmitterEvents {
    UPDATE_THUMBNAIL = "UPDATE_THUMBNAIL",
    ADD_EMPTY_SLIDE = "ADD_EMPTY_SLIDE",
    COPY_SLIDE = "COPY_SLIDE",
    CUT_SLIDE = "CUT_SLIDE",
    DELETE_SLIDE = "DELETE_SLIDE",
    PASTE_SLIDE = "PASTE_SLIDE",
    SHOW_PANELS = "SHOW_PANELS",
    PANELS_TYPE = "PANELS_TYPE",
    OPEN_LATEX = "OPEN_LATEX",
    OPEN_CHART = "OPEN_CHART"
}

type Events = {
    [EmitterEvents.UPDATE_THUMBNAIL]: ISlide;
    [EmitterEvents.ADD_EMPTY_SLIDE]: ISlide | undefined;
    [EmitterEvents.COPY_SLIDE]: void;
    [EmitterEvents.CUT_SLIDE]: void;
    [EmitterEvents.DELETE_SLIDE]: void;
    [EmitterEvents.PASTE_SLIDE]: void;
    [EmitterEvents.SHOW_PANELS]: boolean;
    [EmitterEvents.PANELS_TYPE]: PANELS | "";
    [EmitterEvents.OPEN_LATEX]: IPPTLatexElement;
    [EmitterEvents.OPEN_CHART]: ChartType | IPPTChartElement;
};

const emitter: Emitter<Events> = mitt<Events>();

export default emitter;
