import { ICreatingElement, IPPTElement } from "./element";

export type IOnZoomChange = (zoom: number) => void;

export type IOnEditChange = (cursor: number, length: number, slideId: string) => void;

export type IOnSelectedChange = (element: IPPTElement | null) => void;

export type IOnInsertElementChange = (element: ICreatingElement | null) => void;

export type IOnFontSizeChange = (size: number | string) => void;

export type IOnFontWeightChange = (bold: boolean) => void;
