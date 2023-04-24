import { ISlide } from "@/types/slide";
import View from "./view";
import History from "../editor/history";

export default class Thumbnail extends View {
    constructor(container: HTMLDivElement, slide: ISlide, history: History) {
        super(container, slide, history, false, true);
    }
}
