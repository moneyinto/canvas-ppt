import { IPPTAudioElement } from "@/types/element";
import StageConfig from "./config";
import DB from "@/utils/db";
import { defaultAudioSrc, defaultImageSrc } from "@/config";
import { ActionAnimation } from "./animation";

export default class Music {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _image: HTMLImageElement | undefined;
    private _db: DB;
    private _actionAnimation: ActionAnimation;
    constructor(
        stageConfig: StageConfig,
        ctx: CanvasRenderingContext2D,
        db: DB
    ) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._db = db;
        this._actionAnimation = new ActionAnimation(stageConfig, ctx);
    }

    private async _getCacheImage(element: IPPTAudioElement): Promise<HTMLImageElement> {
        return new Promise(resolve => {
            if (element.cover) {
                const cacheImage = this._stageConfig.cacheImages.find(image => image.id === element.src);
                if (cacheImage) {
                    resolve(cacheImage.image);
                } else {
                    const image = new Image();
                    image.onload = () => {
                        const cacheImage = {
                            id: element.src,
                            image
                        };
                        this._stageConfig.addCacheImage(cacheImage);
                        resolve(cacheImage.image);
                    };
                    try {
                        this._db.getFile(element.src).then(file => {
                            image.src = file || defaultImageSrc;
                        });
                    } catch {
                        image.src = defaultImageSrc;
                    }
                }
            } else {
                if (this._image) {
                    resolve(this._image);
                } else {
                    const image = new Image();
                    image.onload = () => {
                        this._image = image;
                        resolve(image);
                    };
                    image.src = defaultAudioSrc;
                }
            }
        });
    }

    public async draw(element: IPPTAudioElement) {
        const image = await this._getCacheImage(element);
        if (image) {
            const zoom = this._stageConfig.zoom;
            const { x, y } = this._stageConfig.getStageOrigin();

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

            // 缩放
            let viewWidth = element.width;
            let viewHeight = image.height / image.width * viewWidth;
            if (viewHeight > element.height) {
                viewHeight = element.height;
                viewWidth = image.width / image.height * viewHeight;
            }
            this._ctx.drawImage(image, -viewWidth / 2, -viewHeight / 2, viewWidth, viewHeight);

            this._ctx.restore();
        }
    }
}
