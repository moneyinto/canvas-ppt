import { ICreatingElement, IPPTElement } from "./element";

export type IOnZoomChange = (zoom: number) => void;

export type IOnEditChange = (cursor: number, length: number, slideId: string) => void;

export type IOnSelectedChange = (elements: IPPTElement[]) => void;

export type IOnInsertElementChange = (element: ICreatingElement | null) => void;

export type IOnFontSizeChange = (size: number | string) => void;

export type IOnFontWeightChange = (bold: boolean) => void;

export type IOnFontStyleChange = (italic: boolean) => void;

export type IOnFontUnderLineChange = (underline: boolean) => void;

export type IOnFontStrikoutChange = (strikout: boolean) => void;

export type IOnFontFamilyChange = (fontFamily: string) => void;
