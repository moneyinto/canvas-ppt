import { IShapePoolItem } from "../types/shape";

export enum SHAPE_TYPE {
    RECT = "rect",
    RECT_RADIUS = "rectRadius",
    RECT_MINUS_SINGLE_ANGLE = "rectMinusSingleAngle",
    RECT_MINUS_SAME_SIDE_ANGLE = "rectMinusSameSideAngle",
    RECT_MINUS_OPPOSITE_ANGLE = "rectMinusOppositeAngle",
    RECT_SINGLE_RADIUS_MINUS_SINGLE_ANGLE = "rectSingleRadiusMinusSingleAngle"
}

export const SHAPE_LIST: IShapePoolItem[] = [
    {
        type: "矩形",
        children: [
            {
                viewBox: 18,
                name: "矩形",
                path: "M.5 2.5h15v11H.5z",
                type: SHAPE_TYPE.RECT
            },

            {
                viewBox: 18,
                name: "圆角矩形",
                path: "M 3 2.5 L 12.5 2.5 Q 15 2.5 15 5 L 15 11 Q 15 13.5 12.5 13.5 L 3 13.5 Q .5 13.5 .5 11 L .5 5 Q .5 2.5 3 2.5 Z",
                type: SHAPE_TYPE.RECT_RADIUS
            },

            {
                viewBox: 18,
                name: "减去单顶角的矩形",
                path: "M15.5 6.207V13.5H.5v-11h11.293L15.5 6.207Z",
                type: SHAPE_TYPE.RECT_MINUS_SINGLE_ANGLE
            },

            {
                viewBox: 18,
                name: "减去同侧顶角的矩形",
                path: "M15.5 6.207V13.5H.5V6.207L4.207 2.5h7.586L15.5 6.207Z",
                type: SHAPE_TYPE.RECT_MINUS_SAME_SIDE_ANGLE
            },

            {
                viewBox: 18,
                name: "减去对角的矩形",
                path: "M11.793 2.5 15.5 6.207V13.5H4.207L.5 9.793V2.5h11.293Z",
                type: SHAPE_TYPE.RECT_MINUS_OPPOSITE_ANGLE
            },

            {
                viewBox: 18,
                name: "一个圆顶角并减去另一个顶角的矩形",
                path: "M15.5 6.207V13.5H.5V5A2.5 2.5 0 0 1 3 2.5h8.793L15.5 6.207Z",
                type: SHAPE_TYPE.RECT_SINGLE_RADIUS_MINUS_SINGLE_ANGLE
            }
        ]
    }
];
