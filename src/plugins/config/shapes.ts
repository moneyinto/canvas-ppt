import { IShapePoolItem } from "../types/shape";

export enum SHAPE_TYPE {
    RECT = "rect",
    RECT_RADIUS = "rectRadius"
}

export const SHAPE_LIST: IShapePoolItem[] = [
    {
        type: "矩形",
        children: [
            {
                viewBox: 18,
                path: "M.5 2.5h15v11H.5z",
                type: SHAPE_TYPE.RECT
            },

            {
                viewBox: 18,
                path: "M 3 2.5 L 12.5 2.5 Q 15 2.5 15 5 L 15 11 Q 15 13.5 12.5 13.5 L 3 13.5 Q .5 13.5 .5 11 L .5 5 Q .5 2.5 3 2.5 Z",
                type: SHAPE_TYPE.RECT_RADIUS
            }
        ]
    }
];
