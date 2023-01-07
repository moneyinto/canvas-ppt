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
            }
        ]
    }
];
