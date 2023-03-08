import Stage from "../stage";
import StageConfig from "../stage/config";
import { ISlide } from "../types/slide";
import Background from "../stage/draw/background";

export default class Thumbnail {
    private _stageConfig: StageConfig;
    private _slide: ISlide;
    private _stage: Stage;
    private _background: Background;

    constructor(container: HTMLDivElement, slide: ISlide) {
        this._slide = slide;

        // 画板配置
        this._stageConfig = new StageConfig(container);

        // 创建展示画板
        this._stage = new Stage(container, this._stageConfig);

        this._background = new Background(this._stageConfig, this._stage.ctx);

        this._drawPage();
    }

    private async _drawPage() {
        await this._background.draw(this._slide.background);

        this._stage.drawElements(this._slide.elements);
    }

    public updateSlide(slide: ISlide) {
        this._slide = slide;
        this._stage.clear();
        this._drawPage();
    }
}
