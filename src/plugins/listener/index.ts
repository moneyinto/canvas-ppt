import {
    IOnZoomChange,
    IOnEditChange,
    IOnSelectedChange,
    IOnInsertElementChange,
    IOnFontSizeChange
} from "../types/listener";

export default class Listener {
    public onZoomChange: IOnZoomChange | null;
    public onEditChange: IOnEditChange | null;
    public onSelectedChange: IOnSelectedChange | null;
    public onInsertElementChange: IOnInsertElementChange | null;
    public onFontSizeChange: IOnFontSizeChange | null;
    constructor() {
        this.onZoomChange = null;
        this.onEditChange = null;
        this.onSelectedChange = null;
        this.onInsertElementChange = null;
        this.onFontSizeChange = null;
    }
}
