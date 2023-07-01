import { ISlide } from "@/types/slide";
import Background from "../stage/background";
import Stage from "../stage";
import DB from "@/utils/db";
import StageConfig from "../stage/config";
export default class Thumbnail {
    public stageConfig: StageConfig;
    public slide: ISlide;
    public container: HTMLDivElement;
    public db: DB;
    private _stage: Stage;
    private _background: Background;
    constructor(container: HTMLDivElement, slide: ISlide) {
        this.slide = slide;

        this.container = container;

        this.db = new DB();

        // 画板配置
        this.stageConfig = new StageConfig(container);

        this.stageConfig.setSlides([slide]);
        this.stageConfig.setSlideId(slide.id);

        // 创建展示画板
        this._stage = new Stage(container, this.stageConfig, this.db);
        this._background = new Background(this.stageConfig, this._stage.ctx, this.db);

        this.stageConfig.resetDrawView = () => this._drawPage();

        this._drawPage();
    }

    private _drawPage() {
        this._stage.clear();
        this._background.draw(this.slide.background);
        this._stage.drawElements(this.slide.elements, true);
    }

    public updateSlide(slide: ISlide) {
        this.slide = slide;
        this._drawPage();
    }
}
