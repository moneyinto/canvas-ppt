import { ISlide } from "@/plugins/types/slide";

export const slides: ISlide[] = [
    {
        id: "slideid",
        elements: [
            {
                id: "elementid",
                type: "shape",
                viewBox: 200,
                path: "M 0 0 L 200 0 L 200 200 L 0 200 Z",
                fixedRatio: false,
                fill: "#f60000",
                rotate: 0,
                name: "矩形",
                left: 0,
                top: 0,
                width: 200,
                height: 100
            }
        ]
    }
];
