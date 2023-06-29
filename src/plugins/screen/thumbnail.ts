import { ISlide } from "@/types/slide";
import View from "./view";

export default class Thumbnail extends View {
    constructor(container: HTMLDivElement, slide: ISlide) {
        super(container, slide, false, true);
    }
}
