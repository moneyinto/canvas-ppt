import Stage from "../stage";
import StageConfig from "../stage/config";
import { ISlide } from "@/types/slide";
import Background from "../stage/draw/background";
import History from "../editor/history";
import { throttleRAF } from "@/utils";

export default class View {
    private _stageConfig: StageConfig;
    private _slide: ISlide;
    private _stage: Stage;
    private _background: Background;
    private _resizeObserver: ResizeObserver | null;
    private _container: HTMLDivElement;
    private _resize: boolean;

    constructor(container: HTMLDivElement, slide: ISlide, history?: History, resize?: boolean) {
        this._slide = slide;

        this._container = container;
        this._resizeObserver = null;
        this._resize = !!resize;

        // 画板配置
        this._stageConfig = new StageConfig(container);

        // 创建展示画板
        this._stage = new Stage(container, this._stageConfig, history);

        this._background = new Background(this._stageConfig, this._stage.ctx);

        this._drawPage();

        if (resize) {
            // 延迟启用监听事件，避免初始化时触发，导致图片透明度渲染异常
            setTimeout(() => {
                window.addEventListener(
                    "resize",
                    throttleRAF(this._reset.bind(this))
                );

                this._resizeObserver = new ResizeObserver(throttleRAF(this._reset.bind(this)));

                this._resizeObserver.observe(container);
            }, 2000);
        }
    }

    private _reset() {
        const width = this._stageConfig.getWidth();
        const height = this._stageConfig.getHeight();
        this._stage.canvas.style.width = `${width}px`;
        this._stage.canvas.style.height = `${height}px`;

        const dpr = window.devicePixelRatio;
        this._stage.canvas.width = width * dpr;
        this._stage.canvas.height = height * dpr;
        this._stage.ctx.scale(dpr, dpr);

        this._stageConfig.resetBaseZoom();

        this._stage.clear();
        this._drawPage();
    }

    private async _drawPage() {
        await this._background.draw(this._slide.background);
        await this._stage.drawElements(this._slide.elements, true);
    }

    public updateSlide(slide: ISlide) {
        this._slide = slide;
        this._stage.clear();
        this._drawPage();
    }

    public destroy() {
        if (this._resize) {
            window.removeEventListener("resize", this._reset.bind(this));
            this._resizeObserver?.unobserve(this._container);
        }
    }
}
