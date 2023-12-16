export interface IContextmenuItem {
    text?: string;
    subText?: string;
    divider?: boolean;
    disable?: boolean;
    hide?: boolean;
    icon?: string;
    size?: number;
    children?: IContextmenuItem[];
    handler?: () => void;
}

export interface IAxis {
    x: number;
    y: number;
}
