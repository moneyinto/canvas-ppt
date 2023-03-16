import { ICacheImage } from "@/plugins/types";
import { IPPTImageElement } from "@/plugins/types/element";
import StageConfig from "../config";
import { Shadow } from "./shadow";

export class Picture {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _shadow: Shadow;
    constructor(stageConfig: StageConfig, ctx: CanvasRenderingContext2D) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._shadow = new Shadow(this._ctx);
    }

    private _getCacheImage(element: IPPTImageElement): Promise<ICacheImage> {
        return new Promise(resolve => {
            const cacheImage = this._stageConfig.cacheImages.find(image => image.id === element.id);
            if (cacheImage) {
                resolve(cacheImage);
            } else {
                const image = new Image();
                image.onload = () => {
                    const cacheImage = {
                        id: element.id,
                        image
                    };
                    this._stageConfig.addCacheImage(cacheImage);
                    resolve(cacheImage);
                };
                image.src = element.src;
            }
        });
    }

    public async draw(element: IPPTImageElement) {
        const cacheImage = await this._getCacheImage(element);
        if (cacheImage) {
            const image = cacheImage.image;
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

            if (element.shadow) {
                this._shadow.draw(element.shadow, zoom);
            }

            // 设置透明度
            this._ctx.globalAlpha = (100 - (element.opacity || 0)) / 100;

            if (element.streach === 1) {
                // 拉伸
                this._ctx.drawImage(image, -element.width / 2, -element.height / 2, element.width, element.height);
            } else {
                // 缩放
                let viewWidth = element.width;
                let viewHeight = image.height / image.width * viewWidth;
                if (viewHeight > element.height) {
                    viewHeight = element.height;
                    viewWidth = image.width / image.height * viewHeight;
                }
                this._ctx.drawImage(image, -viewWidth / 2, -viewHeight / 2, viewWidth, viewHeight);
            }

            this._ctx.restore();
        }
    }
}
