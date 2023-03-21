import { IFormula } from "@/types/latex";

export const fontSizes: IFormula[] = [
    {
        url: new URL("@/assets/latex/fontSize/size1.png", import.meta.url).href,
        text: "tiny"
    },

    {
        url: new URL("@/assets/latex/fontSize/size2.png", import.meta.url).href,
        text: "scriptsize"
    },

    {
        url: new URL("@/assets/latex/fontSize/size3.png", import.meta.url).href,
        text: "small"
    },

    {
        url: new URL("@/assets/latex/fontSize/size4.png", import.meta.url).href,
        text: "normalsize"
    },

    {
        url: new URL("@/assets/latex/fontSize/size5.png", import.meta.url).href,
        text: "large"
    },

    {
        url: new URL("@/assets/latex/fontSize/size6.png", import.meta.url).href,
        text: "Large"
    },

    {
        url: new URL("@/assets/latex/fontSize/size7.png", import.meta.url).href,
        text: "LARGE"
    },

    {
        url: new URL("@/assets/latex/fontSize/size8.png", import.meta.url).href,
        text: "huge"
    },

    {
        url: new URL("@/assets/latex/fontSize/size9.png", import.meta.url).href,
        text: "Huge"
    }
];
