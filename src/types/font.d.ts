export interface IFontConfig {
    fontSize: number;
    fontWeight: string;
    fontFamily: string;
    fontColor: string;
    fontStyle: string;
    underline: boolean;
    strikout: boolean;
}

export interface IFontData {
    value: string;
    fontSize: number;
    width: number;
    height: number;
    fontStyle: string;
    fontWeight: string;
    fontFamily: string;
    fontColor: string;
    underline: boolean;
    strikout: boolean;
}

export interface ILineData {
    height: number;
    width: number;
    texts: IFontData[];
}
