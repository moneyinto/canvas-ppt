import { IOnZoomChange, IOnCanMoveChange } from "../types/listener";

export default class Listener {
    public onZoomChange: IOnZoomChange | null;
    public onCanMoveChange: IOnCanMoveChange | null;
    constructor() {
        this.onZoomChange = null;
        this.onCanMoveChange = null;
    }
}
