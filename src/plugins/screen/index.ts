import { ISlide } from "@/types/slide";
import { debounce, getVideoElementControlPoints, sleep, throttleRAF } from "@/utils";
import { IRects } from "@/types";
import { IPPTVideoElement } from "@/types/element";
import { PageAnimation } from "../stage/animation";
import { ScreenElementAnimation } from "./animation";
import Background from "../stage/background";
import Stage from "../stage";
import DB from "@/utils/db";
import StageConfig from "../stage/config";

export default class Screen {
    public stageConfig: StageConfig;
    public slide: ISlide;
    private _storeSlide: ISlide;
    public container: HTMLDivElement;
    public db: DB;
    private _stage: Stage;
    private _animationStage: Stage;
    private _background: Background;
    private _animationBackground: Background;
    private _resizeObserver: ResizeObserver | null;
    private _elementAnimation: ScreenElementAnimation;
    private _pageAnimation: PageAnimation;

    private _videoControlType = "";
    private _audioControlType = "";
    public mouseSingleClick: () => void = () => {};
    constructor(container: HTMLDivElement, slide: ISlide) {
        this.slide = slide;
        this._storeSlide = slide;

        this.container = container;
        this._resizeObserver = null;

        this.db = new DB();

        // 画板配置
        this.stageConfig = new StageConfig(container);

        // 初始化页面动画状态
        this.stageConfig.initSlideAnimation(slide);

        // 创建展示画板
        this._stage = new Stage(container, this.stageConfig, this.db);
        this._background = new Background(this.stageConfig, this._stage.ctx, this.db);

        // 创建切页动画执行画板 ！！！考虑要不要将元素动画也放到动画执行画板上，降低渲染元素过多的压力
        this._animationStage = new Stage(container, this.stageConfig, this.db);
        this._animationBackground = new Background(this.stageConfig, this._animationStage.ctx, this.db);

        this._elementAnimation = new ScreenElementAnimation(this.stageConfig);

        this._pageAnimation = new PageAnimation(this.stageConfig, this._animationStage, this._animationBackground);

        this._init();

        this._resizeObserver = new ResizeObserver(debounce(this._reset.bind(this), 100));

        this._resizeObserver.observe(container);

        this.container.addEventListener(
            "mousedown",
            this._mousedown.bind(this),
            false
        );
        this.container.addEventListener(
            "mousemove",
            throttleRAF(this._mousemove.bind(this)),
            false
        );
    }

    private _init() {
        if (this.slide.turningAni) {
            this._pageAnimation.start(this.slide, async () => {
                // 初始化完后再赋值
                this.stageConfig.resetDrawView = async () => {
                    await this._drawPage();
                };
                await this._drawPage();
                this._initAnimations();
            });
        } else {
            // 初始化完后再赋值
            this.stageConfig.resetDrawView = async () => {
                await this._drawPage();
            };

            this._initAnimations();
        }
    }

    private _createAudio(id: string, file: string) {
        const audio = document.createElement("audio");
        audio.id = id;
        audio.src = file;
        audio.style.visibility = "hidden";
        audio.style.position = "absolute";
        audio.style.zIndex = "-1000";
        document.body.appendChild(audio);
        return audio;
    }

    private _getAudio(id: string, src: string): Promise<HTMLAudioElement> {
        return new Promise(resolve => {
            let audio = document.getElementById(id);
            if (audio) return resolve(audio as HTMLAudioElement);
            this.db.getFile(src).then((file: string) => {
                audio = this._createAudio(id, file);
                audio.oncanplay = async () => {
                    await sleep(200);
                    resolve(audio as HTMLAudioElement);
                };
            });
        });
    }

    private async _mousedown(evt: MouseEvent) {
        const { left, top } = this._getMousePosition(evt);
        if (this._videoControlType || this._audioControlType) {
            const hoverElement = this.stageConfig.getMouseInElement(
                left,
                top,
                this.ctx,
                this.slide.elements
            ) as IPPTVideoElement;
            if (hoverElement) {
                if (hoverElement.type === "video") {
                    const video = document.getElementById(hoverElement.id) as HTMLVideoElement;
                    // 视频实际操作
                    if (this._videoControlType === "PLAY_PAUSE_BTN") {
                        // 播放与暂停
                        if (video.paused) {
                            video.play();
                            video.onended = () => this.stageConfig.stopVideoRender();
                            video.onpause = () => this.stageConfig.stopVideoRender();
                            this.stageConfig.startVideoRender();
                        } else {
                            video.pause();
                            this.stageConfig.stopVideoRender();
                        }
                    } else if (this._videoControlType === "PROGRESS_LINE") {
                        // 进度条
                        const progress = (left - hoverElement.left - 15) / (hoverElement.width - 30);
                        video.currentTime = video.duration * progress;
                        setTimeout(() => {
                            if (video.paused) this.stageConfig.resetCheckDrawView();
                        }, 100);
                    } else if (this._videoControlType === "FULLSCREEN_BTN") {
                        // 全屏
                        video.classList.add("full-screen-video");
                        video.requestFullscreen();
                        video.onfullscreenchange = () => {
                            if (video.classList.contains("full-sceen-active")) {
                                video.classList.remove("full-sceen-active");
                                video.classList.remove("full-screen-video");
                                // 视频还正在播放当中，开机同步渲染
                                if (!video.paused && !video.ended) {
                                    this.stageConfig.startVideoRender();
                                } else {
                                    // 视频暂停状态，退出全屏重新渲染一下，同步视频进度
                                    // 延迟渲染，防止出现视频渲染压扁现象
                                    setTimeout(() => {
                                        this.stageConfig.resetCheckDrawView();
                                    }, 30);
                                }
                                // 视频退出全屏，进行聚焦
                                this.container.focus();
                            } else {
                                video.classList.add("full-sceen-active");
                            }
                        };
                        video.controls = true;
                    }
                } else if (hoverElement.type === "audio") {
                    const audio = await this._getAudio(hoverElement.id, hoverElement.src);
                    if (this._audioControlType === "PLAY_PAUSE_BTN") {
                        // 播放与暂停
                        if (audio.paused) {
                            audio.play();
                        } else {
                            audio.pause();
                        }
                    }
                }
            }
        } else {
            this.mouseSingleClick();
        }
    }

    private _getMousePosition(evt: MouseEvent) {
        const zoom = this.stageConfig.zoom;

        const { x, y } = this.stageConfig.getStageArea();
        const { offsetX, offsetY } = this.stageConfig.getCanvasOffset();

        const left = (evt.pageX - x - offsetX) / zoom;
        const top = (evt.pageY - y - offsetY) / zoom;

        return { left, top };
    }

    private _mousemove(evt: MouseEvent) {
        this._videoControlType = "";
        this._audioControlType = "";
        const { left, top } = this._getMousePosition(evt);
        const hoverElement = this.stageConfig.getMouseInElement(
            left,
            top,
            this.ctx,
            this.slide.elements
        );

        if (hoverElement) {
            if (hoverElement.type === "video") {
                // 当元素是视频时，区分播放按钮 全屏按钮 进度条 悬浮状态
                const rects: IRects = getVideoElementControlPoints(
                    hoverElement.left,
                    hoverElement.top,
                    hoverElement.width,
                    hoverElement.height
                );

                const cx = hoverElement.left + hoverElement.width / 2;
                const cy = hoverElement.top + hoverElement.height / 2;

                for (const key in rects) {
                    if (
                        this.stageConfig.checkPointInRect(
                            left,
                            top,
                            rects[key],
                            cx,
                            cy,
                            (hoverElement.rotate / 180) * Math.PI
                        )
                    ) {
                        this.container.style.cursor = "pointer";
                        this._videoControlType = key;
                        break;
                    } else {
                        this.container.style.cursor = "default";
                    }
                }
            } else if (hoverElement.type === "audio") {
                this._audioControlType = "PLAY_PAUSE_BTN";
                this.container.style.cursor = "pointer";
            }
        } else {
            this.container.style.cursor = "default";
        }
    }

    // 重置元素动画到最后一个
    public resetLastAnimationIndex(slide: ISlide) {
        const animations = slide.animations || [];
        this.stageConfig.animationIndex = animations.length - 1;
    }

    public nextStep() {
        this._pageAnimation.stop();
        this._elementAnimation.stop();
        const animations = this.slide.animations || [];
        if (this.stageConfig.animationIndex < animations.length - 1) {
            const start = this.stageConfig.animationIndex + 1;
            const nextClickIndex = animations.findIndex((item, index) => index > start && item.trigger === "click");
            const end = nextClickIndex > -1 ? nextClickIndex : animations.length;
            this.stageConfig.animationIndex = end - 1;
            this.stageConfig.setActionAnimationsByIndex(start, end);
        }
        this._elementAnimation.start();
    }

    public prevStep() {
        if (this.stageConfig.animationIndex > -1) {
            const animations = this.slide.animations || [];
            const start = this.stageConfig.animationIndex;
            const prevClickIndex = animations.slice(0, start + 1).reverse().findIndex((item, index) => item.trigger === "click" && index > 0);
            this.stageConfig.animationIndex = prevClickIndex > -1 ? start - prevClickIndex : -1;
        }
        this._elementAnimation.stop();
        this._pageAnimation.stop();
        this._drawPage();
    }

    get ctx() {
        return this._stage.ctx;
    }

    private _reset() {
        this._stage.resetStage();

        this._animationStage.resetStage();

        this.stageConfig.resetBaseZoom();
    }

    private _drawPage() {
        this._stage.clear();
        this._background.draw(this.slide.background);
        this._stage.drawElements(this.slide.elements);
    }

    private async _awaitPageAnimation(slide: ISlide) {
        return new Promise((resolve) => {
            this._pageAnimation.start(slide, () => {
                resolve(true);
            });
        });
    }

    public async updateSlide(slide: ISlide, type: "prev" | "next") {
        // 切换页之前，先停止所有动画
        this._elementAnimation.stop();
        this._pageAnimation.stop();
        this.slide = slide;
        if (this._storeSlide.id === slide.id) return;

        this.stageConfig.initSlideAnimation(slide);
        if (type === "prev") {
            this.resetLastAnimationIndex(slide);
            this._elementAnimation.stop();
        }

        // ！！！！！！上一页暂时不做动画
        if (slide.turningAni && type === "next") {
            // 存在切页动画，执行切页动画
            await this._awaitPageAnimation(slide);
        }

        // 切换页之后，更新暂存的slide，为了进行slide的比对，防止动作过快，导致错误动画，比如点击下一页，但是动画还没执行完，快速点击上一页
        this._storeSlide = slide;

        this._drawPage();
        if (type === "next") this._initAnimations();
    }

    private _initAnimations() {
        if (this.slide.animations && this.slide.animations.length > 0 && this.slide.animations[0].trigger !== "click") {
            this._elementAnimation.start();
        }
    }

    public destroy() {
        this._resizeObserver?.unobserve(this.container);
    }
}
