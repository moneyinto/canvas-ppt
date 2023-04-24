import mitt, { Emitter } from "mitt";
import { ISlide } from "@/types/slide";
import { PANELS } from "./panel";
import { ChartType, IPPTChartElement, IPPTLatexElement } from "@/types/element";

export const enum EmitterEvents {
    UPDATE_THUMBNAIL = "UPDATE_THUMBNAIL",
    INIT_SLIDE = "INIT_SLIDE",
    ADD_EMPTY_SLIDE = "ADD_EMPTY_SLIDE",
    COPY_SLIDE = "COPY_SLIDE",
    CUT_SLIDE = "CUT_SLIDE",
    DELETE_SLIDE = "DELETE_SLIDE",
    PASTE_SLIDE = "PASTE_SLIDE",
    SHOW_PANELS = "SHOW_PANELS",
    PANELS_TYPE = "PANELS_TYPE",
    OPEN_LATEX = "OPEN_LATEX",
    OPEN_CHART = "OPEN_CHART",
    FONT_FAMILY_CHANGE = "FONT_FAMILY_CHANGE",
    FONT_SIZE_CHANGE = "FONT_SIZE_CHANGE",
    FONT_WEIGHT_CHANGE = "FONT_WEIGHT_CHANGE",
    FONT_ITALIC_CHANGE = "FONT_ITALIC_CHANGE",
    FONT_UNDERLINE_CHANGE = "FONT_UNDERLINE_CHANGE",
    FONT_STRIKOUT_CHANGE = "FONT_STRIKOUT_CHANGE",
    FONT_COLOR_CHANGE = "FONT_COLOR_CHANGE",
    FONT_ALIGN_CHANGE = "FONT_ALIGN_CHANGE",
    FONT_LINEHEIGHT_CHANGE = "FONT_LINEHEIGHT_CHANGE"
}

type Events = {
    [EmitterEvents.UPDATE_THUMBNAIL]: ISlide;
    [EmitterEvents.INIT_SLIDE]: void;
    [EmitterEvents.ADD_EMPTY_SLIDE]: ISlide | undefined;
    [EmitterEvents.COPY_SLIDE]: void;
    [EmitterEvents.CUT_SLIDE]: void;
    [EmitterEvents.DELETE_SLIDE]: void;
    [EmitterEvents.PASTE_SLIDE]: void;
    [EmitterEvents.SHOW_PANELS]: boolean;
    [EmitterEvents.PANELS_TYPE]: PANELS | "";
    [EmitterEvents.OPEN_LATEX]: IPPTLatexElement | undefined;
    [EmitterEvents.OPEN_CHART]: { args: ChartType | IPPTChartElement; transformation?: boolean };
    [EmitterEvents.FONT_FAMILY_CHANGE]: string;
    [EmitterEvents.FONT_SIZE_CHANGE]: string | number;
    [EmitterEvents.FONT_WEIGHT_CHANGE]: boolean;
    [EmitterEvents.FONT_ITALIC_CHANGE]: boolean;
    [EmitterEvents.FONT_UNDERLINE_CHANGE]: boolean;
    [EmitterEvents.FONT_STRIKOUT_CHANGE]: boolean;
    [EmitterEvents.FONT_COLOR_CHANGE]: string;
    [EmitterEvents.FONT_ALIGN_CHANGE]: "left" | "center" | "right";
    [EmitterEvents.FONT_LINEHEIGHT_CHANGE]: number;
};

const emitter: Emitter<Events> = mitt<Events>();

export default emitter;
