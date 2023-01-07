import { IOnZoomChange, IOnEditChange } from "../types/listener";

export default class Listener {
    public onZoomChange: IOnZoomChange | null;
    public onEditChange: IOnEditChange | null;
    constructor() {
        this.onZoomChange = null;
        this.onEditChange = null;
    }
}
