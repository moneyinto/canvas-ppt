export type IBoundsCoords = [number, number, number, number];

export type IRectParameter = IBoundsCoords;

export type IRects = Record<string, IRectParameter>;

export type IElementOptions = Record<string, string>;

export interface ICacheImage {
    id: string;
    image: HTMLImageElement;
}

export interface IMouseClick {
    x: number;
    y: number;
    textX: number;
    textY: number;
}
