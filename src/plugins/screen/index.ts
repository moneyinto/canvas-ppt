import { ISlide } from "@/types/slide";
import View from "./view";
import { getVideoElementControlPoints, sleep, throttleRAF } from "@/utils";
import { IRects } from "@/types";
import { IPPTVideoElement } from "@/types/element";

export default class Screen extends View {
    private _videoControlType = "";
    private _audioControlType = "";
    public mouseSingleClick: () => void = () => {};
    constructor(container: HTMLDivElement, slide: ISlide) {
        super(container, slide, true, false, true);
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
}
