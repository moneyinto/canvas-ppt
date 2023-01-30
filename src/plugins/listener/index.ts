import { IOnZoomChange, IOnEditChange, IOnSelectedChange } from "../types/listener";

export default class Listener {
    public onZoomChange: IOnZoomChange | null;
    public onEditChange: IOnEditChange | null;
    public onSelectedChange: IOnSelectedChange | null;
    constructor() {
        this.onZoomChange = null;
        this.onEditChange = null;
        this.onSelectedChange = null;
    }
}
