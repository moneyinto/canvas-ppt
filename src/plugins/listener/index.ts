import {
    IOnZoomChange,
    IOnEditChange,
    IOnSelectedChange,
    IOnInsertElementChange,
    IOnFontSizeChange,
    IOnFontWeightChange,
    IOnFontStyleChange,
    IOnFontUnderLineChange
} from "../types/listener";

export default class Listener {
    public onZoomChange: IOnZoomChange | null;
    public onEditChange: IOnEditChange | null;
    public onSelectedChange: IOnSelectedChange | null;
    public onInsertElementChange: IOnInsertElementChange | null;
    public onFontSizeChange: IOnFontSizeChange | null;
    public onFontWeightChange: IOnFontWeightChange | null;
    public onFontStyleChange: IOnFontStyleChange | null;
    public onFontUnderLineChange: IOnFontUnderLineChange | null;
    constructor() {
        this.onZoomChange = null;
        this.onEditChange = null;
        this.onSelectedChange = null;
        this.onInsertElementChange = null;
        this.onFontSizeChange = null;
        this.onFontWeightChange = null;
        this.onFontStyleChange = null;
        this.onFontUnderLineChange = null;
    }
}
