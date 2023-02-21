import { SHAPE_TYPE } from "@/plugins/config/shapes";
import { ISlide } from "@/plugins/types/slide";

export const slides: ISlide[] = [
    {
        id: "slideid1",
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
                opacity: 70,
                flipV: -1,
                flipH: 1,
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
                top: 400,
                start: [0, 0],
                end: [-100, 80],
                style: "solid",
                startStyle: "arrow",
                endStyle: "dot",
                name: "线条",
                type: "line",
                borderWidth: 12
            },
            {
                id: "7Yw88w",
                left: 200,
                top: 200,
                name: "文本",
                type: "text",
                content: [
                    {
                        value: "富",
                        fontSize: 56,
                        width: 56,
                        height: 51.85600280761719,
                        fontStyle: "normal",
                        fontWeight: "normal",
                        fontFamily: "楷体",
                        fontColor: "#444",
                        underline: false,
                        strikout: false
                    },
                    {
                        value: "文",
                        fontSize: 56,
                        width: 56,
                        height: 51.96800231933594,
                        fontStyle: "normal",
                        fontWeight: "normal",
                        fontFamily: "楷体",
                        fontColor: "#444",
                        underline: false,
                        strikout: false
                    },
                    {
                        value: "本",
                        fontSize: 56,
                        width: 56,
                        height: 51.183998107910156,
                        fontStyle: "normal",
                        fontWeight: "normal",
                        fontFamily: "楷体",
                        fontColor: "#444",
                        underline: false,
                        strikout: false
                    },
                    {
                        value: "\n",
                        fontSize: 56,
                        width: 0,
                        height: 0,
                        fontStyle: "normal",
                        fontWeight: "normal",
                        fontFamily: "楷体",
                        fontColor: "#444",
                        underline: false,
                        strikout: false
                    }
                ],
                lineHeight: 2,
                wordSpace: 1,
                rotate: 0,
                width: 200,
                height: 122,
                align: "left"
            }
        ]
    },
    {
        id: "slideid2",
        elements: [
            {
                name: "形状",
                type: "shape",
                shape: SHAPE_TYPE.RIGHT_TRIANGLE,
                id: "9Hvcq8",
                left: 0,
                top: 0,
                width: 279.06976744186045,
                height: 242.39713774597493,
                fill: "#5b9bd5",
                fixedRatio: false,
                rotate: 0,
                flipV: -1
            },
            {
                name: "形状",
                type: "shape",
                shape: SHAPE_TYPE.RIGHT_TRIANGLE,
                id: "OxVslP",
                left: 0,
                top: 114,
                width: 518.783542039356,
                height: 449,
                fill: "#5b9bd5",
                fixedRatio: false,
                rotate: 0,
                flipV: 1,
                opacity: 30
            }
        ]
    }
];
