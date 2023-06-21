import {
    IOnZoomChange,
    IOnEditChange,
    IOnUpdateThumbnailSlide,
    IOnSelectedChange,
    IOnInsertElementChange,
    IOnFontSizeChange,
    IOnFontWeightChange,
    IOnFontStyleChange,
    IOnFontUnderLineChange,
    IOnFontStrikoutChange,
    IOnFontFamilyChange,
    IOnTableCellEditChange,
    IOnAnimationsChange
} from "@/types/listener";

export default class Listener {
    public onZoomChange: IOnZoomChange;
    public onEditChange: IOnEditChange;
    public onUpdateThumbnailSlide: IOnUpdateThumbnailSlide;
    public onSelectedChange: IOnSelectedChange;
    public onInsertElementChange: IOnInsertElementChange;
    public onFontSizeChange: IOnFontSizeChange;
    public onFontWeightChange: IOnFontWeightChange;
    public onFontStyleChange: IOnFontStyleChange;
    public onFontUnderLineChange: IOnFontUnderLineChange;
    public onFontStrikoutChange: IOnFontStrikoutChange;
    public onFontFamilyChange: IOnFontFamilyChange;
    public onTableCellEditChange: IOnTableCellEditChange;
    public onAnimationsChange: IOnAnimationsChange;
    constructor() {
        this.onZoomChange = () => {};
        this.onEditChange = () => {};
        this.onUpdateThumbnailSlide = () => {};
        this.onSelectedChange = () => {};
        this.onInsertElementChange = () => {};
        this.onFontSizeChange = () => {};
        this.onFontWeightChange = () => {};
        this.onFontStyleChange = () => {};
        this.onFontUnderLineChange = () => {};
        this.onFontStrikoutChange = () => {};
        this.onFontFamilyChange = () => {};
        this.onTableCellEditChange = () => {};
        this.onAnimationsChange = () => {};
    }
}
