import { SHAPE_TYPE } from "../config/shapes";

export type IShape = SHAPE_TYPE;

export interface IShapeItem {
    viewBox: number;
    name: string;
    path: string;
    type: IShape;
}

export interface IShapePoolItem {
    type: string;
    children: IShapeItem[];
}
