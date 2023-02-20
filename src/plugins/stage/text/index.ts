import StageConfig from "../config";
import { Cursor } from "./cursor";
import { Data } from "./data";
import { Textarea } from "./Textarea";

export class Text {
    private _stageConfig: StageConfig;
    public cursor: Cursor;
    public data: Data;
    public textarea: Textarea;
    constructor(container: HTMLDivElement, stageConfig: StageConfig, ctx: CanvasRenderingContext2D) {
        this._stageConfig = stageConfig;

        this.textarea = new Textarea(container);
        this.data = new Data(ctx, stageConfig);
        this.cursor = new Cursor(container, stageConfig, this.data, this.textarea);
    }
}
