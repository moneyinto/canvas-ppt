import Stage from "../stage";
import StageConfig from "../stage/config";
import { ISlide } from "@/types/slide";
import Background from "../stage/draw/background";
import History from "../editor/history";
import { debounce } from "@/utils";

export default class View {
    public stageConfig: StageConfig;
    public slide: ISlide;
    public container: HTMLDivElement;
    private _stage: Stage;
    private _background: Background;
    private _resizeObserver: ResizeObserver | null;
    private _resize: boolean;
    private _isThumbnail: boolean;

    constructor(container: HTMLDivElement, slide: ISlide, history: History, resize?: boolean, isThumbnail?: boolean) {
        this.slide = slide;

        this.container = container;
        this._resizeObserver = null;
        this._resize = !!resize;
        this._isThumbnail = !!isThumbnail;

        // 画板配置
        this.stageConfig = new StageConfig(container);

        // 创建展示画板
        this._stage = new Stage(container, this.stageConfig, history);

        this._background = new Background(this.stageConfig, this._stage.ctx, history);

        this.stageConfig.resetDrawView = async () => {
            await this._drawPage();
        };

        if (this._resize) {
            this._resizeObserver = new ResizeObserver(debounce(this._reset.bind(this), 100));

            this._resizeObserver.observe(container);
        } else {
            this._drawPage();
        }
    }

    get ctx() {
        return this._stage.ctx;
    }

    private _reset() {
        this._stage.resetStage();

        this.stageConfig.resetBaseZoom();
    }

    private async _drawPage() {
        this._stage.clear();
        await this._background.draw(this.slide.background);
        await this._stage.drawElements(this.slide.elements, this._isThumbnail);
    }

    public updateSlide(slide: ISlide) {
        this.slide = slide;
        this._drawPage();
    }

    public destroy() {
        if (this._resize) {
            this._resizeObserver?.unobserve(this.container);
        }
    }
}
