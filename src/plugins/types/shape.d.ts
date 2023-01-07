export interface IShapeItem {
    viewBox: number;
    path: string;
    type: "rect";
}

export interface IShapePoolItem {
    type: string;
    children: IShapeItem[];
}
