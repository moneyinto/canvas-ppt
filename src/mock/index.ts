import { ISlide } from "@/plugins/types/slide";

export const slides: ISlide[] = [
    {
        id: "slideid",
        elements: [
            {
                id: "elementid",
                type: "shape",
                shape: "rect",
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
                rotate: 63.96187791150659,
                shape: "rect",
                top: 120.71078431372548,
                type: "shape",
                width: 370.91503267973854
            }
        ]
    }
];
