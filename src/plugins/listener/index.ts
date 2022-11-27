import { IOnZoomChange } from "../types/listener";

export default class Listener {
    public onZoomChange: IOnZoomChange | null;
    constructor() {
        this.onZoomChange = null;
    }
}
