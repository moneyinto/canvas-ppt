import { SHAPE_TYPE, LINE_TYPE } from "../config/shapes";
import { ICreatingType } from "./element";

export type IShape = SHAPE_TYPE;

export type ILine = LINE_TYPE;

export interface IShapeItem {
    viewBox: number;
    name: string;
    path: string;
    type: IShape;
}

export interface ILineItem {
    viewBox: number;
    name: string;
    path: string;
    type: ILine;
}

export interface IShapePoolItem {
    type: ICreatingType;
    name: string;
    children: IShapeItem[] | ILineItem[];
}
