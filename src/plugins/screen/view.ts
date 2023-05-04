import Stage from "../stage";
import StageConfig from "../stage/config";
import { ISlide } from "@/types/slide";
import Background from "../stage/draw/background";
import History from "../editor/history";
import { debounce } from "@/utils";

export default class View {
    private _stageConfig: StageConfig;
    private _slide: ISlide;
    private _stage: Stage;
    private _background: Background;
    private _resizeObserver: ResizeObserver | null;
    private _container: HTMLDivElement;
    private _resize: boolean;
    private _isThumbnail: boolean;

    constructor(container: HTMLDivElement, slide: ISlide, history: History, resize?: boolean, isThumbnail?: boolean) {
        this._slide = slide;

        this._container = container;
        this._resizeObserver = null;
        this._resize = !!resize;
        this._isThumbnail = !!isThumbnail;

        // 画板配置
        this._stageConfig = new StageConfig(container);

        // 创建展示画板
        this._stage = new Stage(container, this._stageConfig, history);

        this._background = new Background(this._stageConfig, this._stage.ctx, history);

        if (this._resize) {
            this._resizeObserver = new ResizeObserver(debounce(this._reset.bind(this), 100));

            this._resizeObserver.observe(container);
        } else {
            this._drawPage();
        }
    }

    private _reset() {
        this._stage.resetStage();

        this._stageConfig.resetBaseZoom();

        this._drawPage();
    }

    private async _drawPage() {
        this._stage.clear();
        await this._background.draw(this._slide.background);
        await this._stage.drawElements(this._slide.elements, this._isThumbnail);
    }

    public updateSlide(slide: ISlide) {
        this._slide = slide;
        this._drawPage();
    }

    public destroy() {
        if (this._resize) {
            this._resizeObserver?.unobserve(this._container);
        }
    }
}
