import Stage from ".";
import Listener from "../listener";
import StageConfig from "./config";

export default class ViewStage extends Stage {
    constructor(container: HTMLDivElement, listener: Listener, stageConfig: StageConfig) {
        super(container, listener, stageConfig);

        this._drawPage();
    }

    private _drawPage() {
        const { x, y, stageWidth, stageHeight } = this.stageConfig.getStageArea();
        // 设置阴影
        this.ctx.shadowColor = "#eee";
        this.ctx.shadowBlur = 12;

        this.ctx.fillStyle = "white";
        this.ctx.fillRect(x, y, stageWidth, stageHeight);
        this.ctx.stroke();
    }

    public resetDrawPage() {
        const width = this.stageConfig.getWidth();
        const height = this.stageConfig.getHeight();
        this.ctx.clearRect(0, 0, width, height);

        this._drawPage();
    }
}
