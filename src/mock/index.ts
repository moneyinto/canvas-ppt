import { SHAPE_TYPE } from "@/plugins/config/shapes";
import { ISlide } from "@/plugins/types/slide";

export const slides: ISlide[] = [
    {
        id: "slideid",
        elements: [
            {
                id: "elementid",
                type: "shape",
                shape: SHAPE_TYPE.RECT,
                fixedRatio: false,
                fill: "#f60000",
                rotate: 20,
                name: "矩形",
                left: 10,
                top: 20,
                width: 200,
                height: 100,
                outline: {
                    style: "dashed",
                    width: 2,
                    color: "blue"
                }
            },
            {
                fill: "#5b9bd5",
                fixedRatio: false,
                height: 210.7843137254902,
                id: "7Yw8SR",
                left: 314.54248366013064,
                name: "形状",
                rotate: 0,
                shape: SHAPE_TYPE.RECT_RADIUS,
                top: 120.71078431372548,
                type: "shape",
                width: 370.91503267973854
            },
            {
                color: "#5b9bd5",
                id: "7Yw88R",
                left: 300,
                top: 600,
                start: [0, 0],
                end: [100, 80],
                style: "dashed",
                startStyle: "",
                endStyle: "",
                name: "线条",
                type: "line",
                borderWidth: 2
            }
        ]
    }
];
