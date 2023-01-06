export interface IShapeItem {
    viewBox: number;
    path: string;
}

export interface IShapePoolItem {
    type: string;
    children: IShapeItem[];
}
