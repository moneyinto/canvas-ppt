import Stage from ".";
import History from "../editor/history";
import StageConfig from "./config";
import Background from "./draw/background";

export default class ViewStage extends Stage {
    private _background: Background;
    constructor(
        container: HTMLDivElement,
        stageConfig: StageConfig,
        history: History,
        resize?: boolean
    ) {
        super(container, stageConfig, history, resize);

        this._background = new Background(stageConfig, this.ctx, history);
        this._drawPage();
    }

    private async _drawPage() {
        const { x, y, stageWidth, stageHeight } = this.stageConfig.getStageArea();
        const currentSlide = this.stageConfig.getCurrentSlide();

        // 设置阴影
        this.ctx.shadowColor = "#eee";
        this.ctx.shadowBlur = 12;

        this.ctx.fillStyle = "white";
        this.ctx.fillRect(x, y, stageWidth, stageHeight);

        // 绘制背景
        await this._background.draw(currentSlide?.background);

        // 移除阴影设置
        this.ctx.shadowColor = "";
        this.ctx.shadowBlur = 0;

        const elements = currentSlide?.elements || [];
        await this.drawElements(elements);
    }

    public async resetDrawPage() {
        const width = this.stageConfig.getWidth();
        const height = this.stageConfig.getHeight();
        this.ctx.clearRect(0, 0, width, height);

        await this._drawPage();
    }
}
