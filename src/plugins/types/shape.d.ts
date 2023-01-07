export type IShape = "rect";

export interface IShapeItem {
    viewBox: number;
    path: string;
    type: IShape;
}

export interface IShapePoolItem {
    type: string;
    children: IShapeItem[];
}
