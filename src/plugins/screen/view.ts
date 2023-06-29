import Stage from "../stage";
import StageConfig from "../stage/config";
import { ISlide } from "@/types/slide";
import Background from "../stage/draw/background";
import History from "../editor/history";
import { debounce } from "@/utils";
import Animation from "./animation";

export default class View {
    public stageConfig: StageConfig;
    public slide: ISlide;
    public container: HTMLDivElement;
    private _stage: Stage;
    private _background: Background;
    private _resizeObserver: ResizeObserver | null;
    private _resize: boolean;
    private _isThumbnail: boolean;
    private _isScreen: boolean;
    private _animation: Animation;

    constructor(container: HTMLDivElement, slide: ISlide, history: History, resize?: boolean, isThumbnail?: boolean, isScreen?: boolean) {
        this.slide = slide;

        this.container = container;
        this._resizeObserver = null;
        this._resize = !!resize;
        this._isThumbnail = !!isThumbnail;
        this._isScreen = !!isScreen;

        // 画板配置
        this.stageConfig = new StageConfig(container);

        // 初始化页面动画状态
        this._isScreen && this.stageConfig.initSlideAnimation(slide);

        // 创建展示画板
        this._stage = new Stage(container, this.stageConfig, history);

        this._background = new Background(this.stageConfig, this._stage.ctx, history);

        this.stageConfig.resetDrawView = async () => {
            await this._drawPage();
        };

        this._animation = new Animation(this.stageConfig);

        this._initAnimations();

        if (this._resize) {
            this._resizeObserver = new ResizeObserver(debounce(this._reset.bind(this), 100));

            this._resizeObserver.observe(container);
        } else {
            this._drawPage();
        }
    }

    public resetLastAnimationIndex() {
        const animations = this.slide.animations || [];
        this.stageConfig.animationIndex = animations.length - 1;
        this._animation.stop();
    }

    public nextStep() {
        this._animation.stop();
        const animations = this.slide.animations || [];
        if (this.stageConfig.animationIndex < animations.length - 1) {
            const start = this.stageConfig.animationIndex + 1;
            const nextClickIndex = animations.findIndex((item, index) => index > start && item.trigger === "click");
            const end = nextClickIndex > -1 ? nextClickIndex : animations.length;
            this.stageConfig.animationIndex = end - 1;
            this.stageConfig.setActionAnimationsByIndex(start, end);
        }
        this._animation.start();
    }

    public prevStep() {
        if (this.stageConfig.animationIndex > -1) {
            const animations = this.slide.animations || [];
            const start = this.stageConfig.animationIndex;
            const prevClickIndex = animations.slice(0, start + 1).reverse().findIndex((item, index) => item.trigger === "click" && index > 0);
            this.stageConfig.animationIndex = prevClickIndex > -1 ? start - prevClickIndex : -1;
        }
        this._animation.stop();
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
        await this._stage.drawElements(this.slide.elements, this._isThumbnail, this._isScreen);
    }

    public updateSlide(slide: ISlide) {
        this._isScreen && this.stageConfig.initSlideAnimation(slide);
        this.slide = slide;
        this._drawPage();

        this._initAnimations();
    }

    private _initAnimations() {
        if (this.slide.animations && this.slide.animations.length > 0 && this.slide.animations[0].trigger !== "click") {
            this._animation.start();
        }
    }

    public destroy() {
        if (this._resize) {
            this._resizeObserver?.unobserve(this.container);
        }
    }
}
