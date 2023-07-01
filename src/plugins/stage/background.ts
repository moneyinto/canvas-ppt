import { VIEWPORT_SIZE, VIEWRATIO } from "@/config/stage";
import { ISlideBackground } from "@/types/slide";
import StageConfig from "./config";
import DB from "@/utils/db";
import Gradient from "./gradient";
import { defaultImageSrc } from "@/config";

export default class Background {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _db: DB;
    private _gradient: Gradient;
    constructor(stageConfig: StageConfig, ctx: CanvasRenderingContext2D, db: DB) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._db = db;
        this._gradient = new Gradient(this._ctx);
    }

    private _getCacheImage(id: string): HTMLImageElement | undefined {
        const cacheImage = window.cacheDomMap.get(id);
        if (cacheImage) {
            return cacheImage as HTMLImageElement;
        } else {
            const image = new Image();
            image.onload = () => {
                window.cacheDomMap.set(id, image);
                this._stageConfig.waitDrawView();
            };
            try {
                this._db.getFile(id).then(file => {
                    image.src = file || defaultImageSrc;
                });
            } catch {
                image.src = defaultImageSrc;
            }
        }
        return undefined;
    }

    public draw(background: ISlideBackground | undefined) {
        const { x, y, stageWidth, stageHeight } = this._stageConfig.getStageArea();

        this._ctx.save();

        if (background) {
            switch (background.type) {
                case "solid": {
                    // 纯色填充
                    this._ctx.fillStyle = background.color || "white";
                    this._ctx.fillRect(x, y, stageWidth, stageHeight);
                    break;
                }
                case "image": {
                    // 背景图片
                    const imageSize = background.imageSize || "cover";
                    const image = background.image;

                    if (image) {
                        const imageElement = this._getCacheImage(image);
                        if (imageElement) {
                            if (imageSize === "cover") {
                                this._ctx.drawImage(imageElement, x, y, stageWidth, stageHeight);
                            } else {
                                const zoom = stageWidth / VIEWPORT_SIZE;
                                this._ctx.translate(x, y);
                                this._ctx.scale(zoom, zoom);
                                const pattern = this._ctx.createPattern(imageElement, "repeat");
                                if (pattern) {
                                    this._ctx.rect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE * VIEWRATIO);
                                    this._ctx.fillStyle = pattern;
                                    this._ctx.fill();
                                }
                            }
                        }
                    }
                    break;
                }
                case "gradient": {
                    // 背景渐变色
                    this._gradient.draw({ x, y, width: stageWidth, height: stageHeight }, background.gradientColor, background.gradientType, background.gradientRotate);
                    break;
                }
            }
        } else {
            this._ctx.fillStyle = "white";
            this._ctx.fillRect(x, y, stageWidth, stageHeight);
        }

        this._ctx.restore();
    }
}
