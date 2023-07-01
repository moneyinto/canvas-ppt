import { IPPTVideoElement } from "@/types/element";
import { sleep, fomatTime } from "@/utils";
import StageConfig from "./config";
import { ActionAnimation } from "./animation";
import DB from "@/utils/db";

export default class Video {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _db: DB;
    private _actionAnimation: ActionAnimation;
    constructor(
        stageConfig: StageConfig,
        ctx: CanvasRenderingContext2D,
        db: DB
    ) {
        this._ctx = ctx;
        this._stageConfig = stageConfig;
        this._db = db;
        this._actionAnimation = new ActionAnimation(stageConfig, ctx);
    }

    public createVideo(id: string, file: string) {
        const video = document.createElement("video");
        video.id = id;
        video.src = file;
        video.style.visibility = "hidden";
        video.style.position = "absolute";
        video.style.zIndex = "-1000";
        document.body.appendChild(video);
        return video;
    }

    public getVideo(id: string, src: string): HTMLVideoElement | undefined {
        let video = document.getElementById(id);
        if (video) return video as HTMLVideoElement;
        this._db.getFile(src).then((file: string) => {
            video = this.createVideo(id, file);
            video.oncanplay = async () => {
                window.cacheDomMap.set(src, video as HTMLVideoElement);
                this._stageConfig.waitDrawView();
            };
        });
        return undefined;
    }

    private getVideoArea(width: number, height: number, video?: HTMLVideoElement) {
        const videoWidth = video?.clientWidth || width;
        const videoHeight = video?.clientHeight || height;
        const cavnasWidth = width;
        const canvasHeight = height;

        let _x = 0;
        let _y = 0;
        let _width = 0;
        let _height = 0;

        const ratio = videoHeight / videoWidth;
        // 宽度作为标准
        if (cavnasWidth * ratio <= canvasHeight) {
            _width = cavnasWidth;
            _height = cavnasWidth * ratio;
            _x = 0;
            _y = (canvasHeight - _height) / 2;
        } else {
            _width = canvasHeight / ratio;
            _height = canvasHeight;
            _x = (cavnasWidth - _width) / 2;
            _y = 0;
        }

        return { _x, _y, _width, _height };
    }

    public async fullScreenDraw(element: IPPTVideoElement, width: number, height: number) {
        const video = await this.getVideo(element.id, element.src);
        this._ctx.save();

        const { _x, _y, _width, _height } = this.getVideoArea(width, height, video);

        this._ctx.fillStyle = "#000000";
        this._ctx.fillRect(0, 0, width, height);

        if (video) {
            this._ctx.drawImage(
                video,
                _x,
                _y,
                _width,
                _height
            );
        }

        this._renderControlBg(width, height);
        this._renderPlayBtn(height, video);
        this._renderPauseBtn(height, video);
        this._renderProgress(width, height, video);
        this._renderTime(height, video);
        // this._renderFullScreen(width, height);

        this._ctx.restore();
    }

    public draw(element: IPPTVideoElement, isThumbnail?: boolean) {
        const zoom = this._stageConfig.zoom;
        const { x, y } = this._stageConfig.getStageOrigin();

        const video = this.getVideo(element.id, element.src);

        this._ctx.save();

        // 缩放画布
        this._ctx.scale(zoom, zoom);

        const ox = x + element.left + element.width / 2;
        const oy = y + element.top + element.height / 2;

        // 平移坐标原点
        this._ctx.translate(ox, oy);
        // 旋转画布
        this._ctx.rotate((element.rotate / 180) * Math.PI);
        // 动画
        this._actionAnimation.setElementStatus(element);
        // 平移坐标原点
        this._ctx.translate(-element.width / 2, -element.height / 2);

        const { _x, _y, _width, _height } = this.getVideoArea(element.width, element.height, video);

        this._ctx.fillStyle = "#000000";
        this._ctx.fillRect(0, 0, element.width, element.height);

        if (video) {
            this._ctx.drawImage(
                video,
                _x,
                _y,
                _width,
                _height
            );
        }

        if (!isThumbnail) {
            this._renderControlBg(element.width, element.height);
            this._renderPlayBtn(element.height, video);
            this._renderPauseBtn(element.height, video);
            this._renderProgress(element.width, element.height, video);
            this._renderTime(element.height, video);
            this._renderFullScreen(element.width, element.height);
        }

        this._ctx.restore();
    }

    private _renderControlBg(width: number, height: number) {
        this._ctx.save();
        const controlY = height - 80;
        const lineargradient = this._ctx.createLinearGradient(
            width / 2,
            height,
            width / 2,
            controlY
        );
        lineargradient.addColorStop(0, "#000000b0");
        lineargradient.addColorStop(1, "#00000000");
        this._ctx.fillStyle = lineargradient;
        this._ctx.fillRect(
            0,
            controlY,
            width,
            80
        );
        this._ctx.restore();
    }

    private _renderPlayBtn(height: number, video?: HTMLVideoElement) {
        if (video && !video.paused) return;
        this._ctx.save();
        const controlY = height - 80;
        const controlX = 20;
        this._ctx.translate(controlX, controlY + 50);
        this._ctx.lineCap = "round";
        this._ctx.lineWidth = 2;
        this._ctx.strokeStyle = "#ffffff";
        this._ctx.beginPath();
        this._ctx.moveTo(0, 0);
        this._ctx.lineTo(0, 12);
        this._ctx.lineTo(10.392, 6);
        this._ctx.closePath();
        this._ctx.stroke();
        this._ctx.restore();
    }

    private _renderPauseBtn(height: number, video?: HTMLVideoElement) {
        if (video?.paused) return;
        this._ctx.save();
        const controlY = height - 80;
        const controlX = 20;
        this._ctx.translate(controlX, controlY + 50);
        this._ctx.lineCap = "round";
        this._ctx.lineWidth = 2;
        this._ctx.strokeStyle = "#ffffff";
        this._ctx.beginPath();
        this._ctx.moveTo(2, 0);
        this._ctx.lineTo(2, 12);
        this._ctx.moveTo(10, 0);
        this._ctx.lineTo(10, 12);
        this._ctx.stroke();
        this._ctx.restore();
    }

    private _renderProgress(width: number, height: number, video?: HTMLVideoElement) {
        this._ctx.save();
        const controlY = height - 80;
        const controlX = 15;
        const progressWidth = width - 30;
        const progress = video ? (video.currentTime / video.duration) : 0;
        this._ctx.translate(controlX, controlY + 35);
        this._ctx.globalAlpha = 0.3;
        this._ctx.lineCap = "round";
        this._ctx.lineWidth = 4;
        this._ctx.strokeStyle = "#ffffff";
        this._ctx.beginPath();
        this._ctx.moveTo(0, 0);
        this._ctx.lineTo(progressWidth, 0);
        this._ctx.stroke();

        this._ctx.fillStyle = "#ffffff";
        this._ctx.globalAlpha = 1;
        this._ctx.beginPath();
        this._ctx.arc(progressWidth * progress, 0, 5, 0, 360);
        this._ctx.fill();

        // 播放进度条
        this._ctx.globalAlpha = 1;
        this._ctx.beginPath();
        this._ctx.moveTo(0, 0);
        this._ctx.lineTo(progressWidth * progress, 0);
        this._ctx.stroke();

        this._ctx.restore();
    }

    private _renderTime(height: number, video?: HTMLVideoElement) {
        this._ctx.save();
        const controlY = height - 80;
        const controlX = 30;
        this._ctx.translate(controlX, controlY + 50);

        this._ctx.fillStyle = "#ffffff";
        this._ctx.font = "12px sans-serif";
        const currentTime = fomatTime(video?.currentTime || 0);
        const duration = fomatTime(video?.duration || 0);
        this._ctx.fillText(`${currentTime} / ${duration}`, 30, 10);

        this._ctx.restore();
    }

    private _renderFullScreen(width: number, height: number) {
        this._ctx.save();
        const controlY = height - 80;
        this._ctx.translate(width - 32, controlY + 50);

        this._ctx.lineCap = "round";
        this._ctx.lineWidth = 2;
        this._ctx.strokeStyle = "#ffffff";

        this._ctx.beginPath();
        if (this._stageConfig.isFullScreen) {
            this._ctx.moveTo(0, 3);
            this._ctx.lineTo(3, 3);
            this._ctx.lineTo(3, 0);
            this._ctx.moveTo(9, 0);
            this._ctx.lineTo(9, 3);
            this._ctx.lineTo(12, 3);
            this._ctx.moveTo(12, 9);
            this._ctx.lineTo(9, 9);
            this._ctx.lineTo(9, 12);
            this._ctx.moveTo(3, 12);
            this._ctx.lineTo(3, 9);
            this._ctx.lineTo(0, 9);
        } else {
            this._ctx.moveTo(0, 3);
            this._ctx.lineTo(0, 0);
            this._ctx.lineTo(3, 0);
            this._ctx.moveTo(9, 0);
            this._ctx.lineTo(12, 0);
            this._ctx.lineTo(12, 3);
            this._ctx.moveTo(12, 9);
            this._ctx.lineTo(12, 12);
            this._ctx.lineTo(9, 12);
            this._ctx.moveTo(3, 12);
            this._ctx.lineTo(0, 12);
            this._ctx.lineTo(0, 9);
        }

        this._ctx.stroke();

        this._ctx.restore();
    }
}
