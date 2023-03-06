import { IShapePoolItem } from "../types/shape";

export enum SHAPE_TYPE {
    RECT = "rect",
    RECT_RADIUS = "rectRadius",
    RECT_MINUS_SINGLE_ANGLE = "rectMinusSingleAngle",
    RECT_MINUS_SAME_SIDE_ANGLE = "rectMinusSameSideAngle",
    RECT_MINUS_OPPOSITE_ANGLE = "rectMinusOppositeAngle",
    RECT_SINGLE_RADIUS_MINUS_SINGLE_ANGLE = "rectSingleRadiusMinusSingleAngle",
    RECT_SINGLE_RADIUS = "rectSingleRadius",
    RECT_SAME_SIDE_RADIUS = "rectSameSideRadius",
    RECT_OPPOSITE_RADIUS = "rectOppositeRadius",
    OVAL = "oval",
    TRIANGLE = "triangle",
    RIGHT_TRIANGLE = "rightTriangle",
    PARALLELOGRAM = "parallelogram",
    TRAPEZOIDAL = "trapezoidal",
    DIAMOND = "diamond",
    PENTAGON = "pentagon",
    HEXAGON = "hexagon", // 六边形
    HEPTAGON = "heptagon", // 七边形
    OCTAGON = "octagon", // 八边形
    DECAGON = "decagon" // 十边形
}

export enum LINE_TYPE {
    BEELINE = "beeline",
    ARROW = "arrow",
    DOUBLE_ARROW = "doubleArrow",
    DOT = "dot",
    DOUBLE_DOT = "doubleDot"
}

export const SHAPE_LIST: IShapePoolItem[] = [
    {
        name: "线条",
        type: "line",
        children: [
            {
                viewBox: 18,
                name: "直线",
                path: "m1 1 14 14",
                type: LINE_TYPE.BEELINE
            },
            {
                viewBox: 18,
                name: "箭头",
                path: "m1 1 12 12 M14 14 L10 12 L12 10Z",
                type: LINE_TYPE.ARROW,
                fill: true
            },
            {
                viewBox: 18,
                name: "双箭头",
                path: "m3 3 10 10 M14 14 L10 12 L12 10Z M1 1 L5 3 L3 5Z",
                type: LINE_TYPE.DOUBLE_ARROW,
                fill: true
            },
            {
                viewBox: 18,
                name: "圆头",
                path: "m1 1 12 12 M 10 12 a 2 2 0 1 0 4 0 M 14 12 a 2 2 0 1 0 -4 0 Z",
                type: LINE_TYPE.DOT,
                fill: true
            },
            {
                viewBox: 18,
                name: "双圆头",
                path: "m3 3 10 10 M 1 3 a 2 2 0 1 0 4 0 M 5 3 a 2 2 0 1 0 -4 0 Z M 10 12 a 2 2 0 1 0 4 0 M 14 12 a 2 2 0 1 0 -4 0 Z",
                type: LINE_TYPE.DOUBLE_DOT,
                fill: true
            }
        ]
    },
    {
        name: "矩形",
        type: "shape",
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
                name: "减去单角的矩形",
                path: "M15.5 6.207V13.5H.5v-11h11.293L15.5 6.207Z",
                type: SHAPE_TYPE.RECT_MINUS_SINGLE_ANGLE
            },

            {
                viewBox: 18,
                name: "减去同侧角的矩形",
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
            },

            {
                viewBox: 18,
                name: "单圆角矩形",
                path: "M.5 2.5H13A2.5 2.5 0 0 1 15.5 5v8.5H.5v-11Z",
                type: SHAPE_TYPE.RECT_SINGLE_RADIUS
            },

            {
                viewBox: 18,
                name: "同侧圆角矩形",
                path: "M.5 5A2.5 2.5 0 0 1 3 2.5h10A2.5 2.5 0 0 1 15.5 5v8.5H.5V5Z",
                type: SHAPE_TYPE.RECT_SAME_SIDE_RADIUS
            },

            {
                viewBox: 18,
                name: "对角圆角矩形",
                path: "M.5 5A2.5 2.5 0 0 1 3 2.5h12.5V11a2.5 2.5 0 0 1-2.5 2.5H.5V5Z",
                type: SHAPE_TYPE.RECT_OPPOSITE_RADIUS
            }
        ]
    },
    {
        name: "基础形状",
        type: "shape",
        children: [
            {
                viewBox: 18,
                name: "矩形",
                path: "M.5 2.5h15v11H.5z",
                type: SHAPE_TYPE.RECT
            },
            {
                viewBox: 18,
                name: "椭圆",
                path: "M14.5 8c0 2.968-2.835 5.5-6.5 5.5S1.5 10.968 1.5 8 4.335 2.5 8 2.5s6.5 2.532 6.5 5.5Z",
                type: SHAPE_TYPE.OVAL
            },
            {
                viewBox: 18,
                name: "三角形",
                path: "M2.097 13.25 9 1.959l6.902 11.291H2.098Z",
                type: SHAPE_TYPE.TRIANGLE
            },
            {
                viewBox: 18,
                name: "直角三角形",
                path: "M1.5 14.5V2L14 14.5H1.5Z",
                type: SHAPE_TYPE.RIGHT_TRIANGLE
            },
            {
                viewBox: 18,
                name: "平行四边形",
                path: "m.75 13.5 4.583-11h9.917l-4.583 11H.75Z",
                type: SHAPE_TYPE.PARALLELOGRAM
            },
            {
                viewBox: 18,
                name: "梯形",
                path: "m.677 13.5 3.692-12h7.262l3.692 12H.677Z",
                type: SHAPE_TYPE.TRAPEZOIDAL
            },
            {
                viewBox: 18,
                name: "菱形",
                path: "M.707 7.778 7.778.708l7.071 7.07-7.071 7.071z",
                type: SHAPE_TYPE.DIAMOND
            },
            {
                viewBox: 18,
                name: "五边形",
                path: "M.98 5.719 8 .618l7.02 5.1-2.681 8.254H3.661L.979 5.72Z",
                type: SHAPE_TYPE.PENTAGON
            },
            {
                viewBox: 18,
                name: "六边形",
                path: "M5.217 1.5h7.423l3.71 6.428-3.71 6.428H5.216L1.506 7.928 5.216 1.5Z",
                type: SHAPE_TYPE.HEXAGON
            },
            {
                viewBox: 18,
                name: "七边形",
                path: "M2.18 3.358 8 .555l5.82 2.803 1.438 6.299-4.028 5.05H4.77L.742 9.658l1.437-6.299Z",
                type: SHAPE_TYPE.HEPTAGON
            },
            {
                viewBox: 18,
                name: "八边形",
                path: "M6.13 2 L 11.87 2 L 16 6.13 L 16 11.87 L 11.87 16 L 6.13 16 L 2 11.87 L 2 6.13 Z",
                type: SHAPE_TYPE.OCTAGON
            },
            {
                viewBox: 18,
                name: "十边形",
                path: "M3.34 4.55 L 6.83 2 L 11.17 2 L 14.66 4.55 L 16 9 L 14.66 13.45 L 11.17 16 L 6.83 16 L 3.34 13.45 L 2 9 Z",
                type: SHAPE_TYPE.DECAGON
            }
        ]
    }
];
