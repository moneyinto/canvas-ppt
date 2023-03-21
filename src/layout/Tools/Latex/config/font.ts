import { IFormula } from "@/types/latex";

export const fonts: IFormula[] = [
    {
        url: new URL("@/assets/latex/font/font1.png", import.meta.url).href,
        text: "mathrm"
    },

    {
        url: new URL("@/assets/latex/font/font2.png", import.meta.url).href,
        text: "mathbf"
    },

    {
        url: new URL("@/assets/latex/font/font3.png", import.meta.url).href,
        text: "mathit"
    },

    {
        url: new URL("@/assets/latex/font/font4.png", import.meta.url).href,
        text: "underline"
    },

    {
        url: new URL("@/assets/latex/font/font5.png", import.meta.url).href,
        text: "mathsf"
    },

    {
        url: new URL("@/assets/latex/font/font6.png", import.meta.url).href,
        text: "mathbb"
    },

    {
        url: new URL("@/assets/latex/font/font7.png", import.meta.url).href,
        text: "mathcal"
    },

    {
        url: new URL("@/assets/latex/font/font8.png", import.meta.url).href,
        text: "mathfrak"
    }
];
