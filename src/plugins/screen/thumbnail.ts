import Stage from "../stage";
import StageConfig from "../stage/config";
import { ISlide } from "../types/slide";

export default class Thumbnail {
    private _stageConfig: StageConfig;
    private _stage: Stage;

    constructor(container: HTMLDivElement, slide: ISlide) {
        // 画板配置
        this._stageConfig = new StageConfig(container);

        // 创建展示画板
        this._stage = new Stage(container, this._stageConfig);

        this._stage.drawElements(slide.elements);
    }

    public updateSlide(slide: ISlide) {
        this._stage.clear();
        this._stage.drawElements(slide.elements);
    }
}
