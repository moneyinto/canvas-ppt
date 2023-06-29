import History from "@/plugins/editor/history";
import { IPPTVideoElement } from "@/types/element";
import { sleep, fomatTime } from "@/utils";
import StageConfig from "./config";
import Animation from "./animation";

export default class Video {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _history: History;
    private _animation: Animation;
    constructor(
        stageConfig: StageConfig,
        ctx: CanvasRenderingContext2D,
        history: History
    ) {
        this._ctx = ctx;
        this._stageConfig = stageConfig;
        this._history = history;
        this._animation = new Animation(stageConfig, ctx);
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

    public getVideo(id: string, src: string): Promise<HTMLVideoElement> {
        return new Promise(resolve => {
            let video = document.getElementById(id);
            if (video) return resolve(video as HTMLVideoElement);
            this._history.getFile(src).then((file: string) => {
                video = this.createVideo(id, file);
                video.oncanplay = async () => {
                    // 延缓处理主图视频无法初始化问题
                    await sleep(200);
                    resolve(video as HTMLVideoElement);
                };
            });
        });
    }

    private getVideoArea(video: HTMLVideoElement, width: number, height: number) {
        const videoWidth = video.clientWidth;
        const videoHeight = video.clientHeight;
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

        const { _x, _y, _width, _height } = this.getVideoArea(video, width, height);

        this._ctx.fillStyle = "#000000";
        this._ctx.fillRect(0, 0, width, height);

        this._ctx.drawImage(
            video,
            _x,
            _y,
            _width,
            _height
        );

        this._renderControlBg(width, height);
        this._renderPlayBtn(video, height);
        this._renderPauseBtn(video, height);
        this._renderProgress(video, width, height);
        this._renderTime(video, height);
        // this._renderFullScreen(width, height);

        this._ctx.restore();
    }

    public async draw(element: IPPTVideoElement, isThumbnail?: boolean) {
        const zoom = this._stageConfig.zoom;
        const { x, y } = this._stageConfig.getStageOrigin();

        const video = await this.getVideo(element.id, element.src);

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
        this._animation.setElementStatus(element);
        // 平移坐标原点
        this._ctx.translate(-element.width / 2, -element.height / 2);

        const { _x, _y, _width, _height } = this.getVideoArea(video, element.width, element.height);

        this._ctx.fillStyle = "#000000";
        this._ctx.fillRect(0, 0, element.width, element.height);

        this._ctx.drawImage(
            video,
            _x,
            _y,
            _width,
            _height
        );

        if (!isThumbnail) {
            this._renderControlBg(element.width, element.height);
            this._renderPlayBtn(video, element.height);
            this._renderPauseBtn(video, element.height);
            this._renderProgress(video, element.width, element.height);
            this._renderTime(video, element.height);
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

    private _renderPlayBtn(video: HTMLVideoElement, height: number) {
        if (!video.paused) return;
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

    private _renderPauseBtn(video: HTMLVideoElement, height: number) {
        if (video.paused) return;
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

    private _renderProgress(video: HTMLVideoElement, width: number, height: number) {
        this._ctx.save();
        const controlY = height - 80;
        const controlX = 15;
        const progressWidth = width - 30;
        const progress = video.currentTime / video.duration;
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

    private _renderTime(video: HTMLVideoElement, height: number) {
        this._ctx.save();
        const controlY = height - 80;
        const controlX = 30;
        this._ctx.translate(controlX, controlY + 50);

        this._ctx.fillStyle = "#ffffff";
        this._ctx.font = "12px sans-serif";
        const currentTime = fomatTime(video.currentTime);
        const duration = fomatTime(video.duration);
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
