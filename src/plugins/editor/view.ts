import Stage from "../stage";
import StageConfig from "../stage/config";
import Background from "../stage/background";
import DB from "@/utils/db";

export default class ViewStage extends Stage {
    private _background: Background;
    constructor(
        container: HTMLDivElement,
        stageConfig: StageConfig,
        db: DB
    ) {
        super(container, stageConfig, db);

        this._background = new Background(stageConfig, this.ctx, db);
        this._drawPage();
    }

    private _drawPage() {
        const { x, y, stageWidth, stageHeight } = this.stageConfig.getStageArea();
        const currentSlide = this.stageConfig.getCurrentSlide();

        // 设置阴影
        this.ctx.shadowColor = "#eee";
        this.ctx.shadowBlur = 12;

        this.ctx.fillStyle = "white";
        this.ctx.fillRect(x, y, stageWidth, stageHeight);

        // 绘制背景
       this._background.draw(currentSlide?.background);

        // 移除阴影设置
        this.ctx.shadowColor = "";
        this.ctx.shadowBlur = 0;

        const elements = currentSlide?.elements || [];
        this.drawElements(elements);
    }

    public async resetDrawPage() {
        const width = this.stageConfig.getWidth();
        const height = this.stageConfig.getHeight();
        this.ctx.clearRect(0, 0, width, height);

        this._drawPage();
    }
}
