import { ICreatingElement, IPPTElement } from "./element";
import { IPPTAnimation, ISlide } from "./slide";

export type IOnZoomChange = (zoom: number) => void;

export type IOnEditChange = (cursor: number, length: number, slideId: string) => void;

export type IOnUpdateThumbnailSlide = (slide: ISlide) => void;

export type IOnSelectedChange = (elements: IPPTElement[]) => void;

export type IOnInsertElementChange = (element: ICreatingElement | null) => void;

export type IOnFontSizeChange = (size: number | string) => void;

export type IOnFontWeightChange = (bold: boolean) => void;

export type IOnFontStyleChange = (italic: boolean) => void;

export type IOnFontUnderLineChange = (underline: boolean) => void;

export type IOnFontStrikoutChange = (strikout: boolean) => void;

export type IOnFontFamilyChange = (fontFamily: string) => void;

export type IOnTableCellEditChange = (mergeDisabled: boolean, splitDisabled: boolean) => void;

export type IOnAnimationsChange = () => void;

export type IOnAnimationsEnd = () => void;
