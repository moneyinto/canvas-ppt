import { throttleRAF } from "@/utils";
import { Ref } from "vue";

export default (left: Ref<number>, top: Ref<number>, width: Ref<number>, height: Ref<number>) => {
    const resizePointers = [
        {
            style: {
                left: "0px",
                top: "0px",
                cursor: "nwse-resize"
            },
            direction: "L-T"
        },
        {
            style: {
                left: "50%",
                top: "0px",
                cursor: "ns-resize"
            },
            direction: "T"
        },
        {
            style: {
                left: "100%",
                top: "0px",
                cursor: "nesw-resize"
            },
            direction: "R-T"
        },
        {
            style: {
                left: "100%",
                top: "50%",
                cursor: "ew-resize"
            },
            direction: "R"
        },
        {
            style: {
                left: "100%",
                top: "100%",
                cursor: "nwse-resize"
            },
            direction: "R-B"
        },
        {
            style: {
                left: "50%",
                top: "100%",
                cursor: "ns-resize"
            },
            direction: "B"
        },
        {
            style: {
                left: "0px",
                top: "100%",
                cursor: "nwse-resize"
            },
            direction: "L-B"
        },
        {
            style: {
                left: "0px",
                top: "50%",
                cursor: "ew-resize"
            },
            direction: "L"
        }
    ];

    const startPoint = {
        x: 0,
        y: 0
    };
    const resize = (event: MouseEvent, direction: string) => {
        startPoint.x = event.pageX;
        startPoint.y = event.pageY;
        document.onmousemove = throttleRAF((event: MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();
            const moveX = event.pageX - startPoint.x;
            const moveY = event.pageY - startPoint.y;
            startPoint.x = event.pageX;
            startPoint.y = event.pageY;
            if (/L/.test(direction)) {
                width.value -= moveX;
                left.value += moveX;
            }

            if (/R/.test(direction)) {
                width.value += moveX;
            }

            if (/T/.test(direction)) {
                height.value -= moveY;
                top.value += moveY;
            }

            if (/B/.test(direction)) {
                height.value += moveY;
            }
        });

        document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };

    return {
        resizePointers,
        resize
    };
};
