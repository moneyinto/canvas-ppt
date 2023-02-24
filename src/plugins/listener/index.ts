import {
    IOnZoomChange,
    IOnEditChange,
    IOnSelectedChange,
    IOnInsertElementChange,
    IOnFontSizeChange,
    IOnFontWeightChange,
    IOnFontStyleChange,
    IOnFontUnderLineChange,
    IOnFontStrikoutChange,
    IOnFontFamilyChange
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
    public onFontStrikoutChange: IOnFontStrikoutChange | null;
    public onFontFamilyChange: IOnFontFamilyChange | null;
    constructor() {
        this.onZoomChange = null;
        this.onEditChange = null;
        this.onSelectedChange = null;
        this.onInsertElementChange = null;
        this.onFontSizeChange = null;
        this.onFontWeightChange = null;
        this.onFontStyleChange = null;
        this.onFontUnderLineChange = null;
        this.onFontStrikoutChange = null;
        this.onFontFamilyChange = null;
    }
}
