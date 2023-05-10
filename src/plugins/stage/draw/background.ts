import { VIEWPORT_SIZE, VIEWRATIO } from "@/plugins/config/stage";
import { ISlideBackground } from "@/types/slide";
import StageConfig from "../config";
import { ICacheImage } from "@/types";
import History from "@/plugins/editor/history";
import Gradient from "./gradient";
import { defaultImageSrc } from "@/plugins/config";

export default class Background {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _history: History;
    private _gradient: Gradient;
    constructor(stageConfig: StageConfig, ctx: CanvasRenderingContext2D, history: History) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._history = history;
        this._gradient = new Gradient(this._ctx);
    }

    private _getCacheImage(id: string): Promise<ICacheImage> {
        return new Promise(resolve => {
            let isDefault = false;
            const cacheImage = this._stageConfig.cacheImages.find(image => image.id === id);
            if (cacheImage) {
                resolve(cacheImage);
            } else {
                const image = new Image();
                image.onload = () => {
                    const cacheImage = {
                        id,
                        image
                    };
                    if (!isDefault) this._stageConfig.addCacheImage(cacheImage);
                    resolve(cacheImage);
                };
                try {
                    this._history.getFile(id).then(file => {
                        isDefault = !file;
                        image.src = file || defaultImageSrc;
                    });
                } catch {
                    isDefault = true;
                    image.src = defaultImageSrc;
                }
            }
        });
    }

    public async draw(background: ISlideBackground | undefined) {
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
                        const imageElement = await this._getCacheImage(image);

                        if (imageSize === "cover") {
                            this._ctx.drawImage(imageElement.image, x, y, stageWidth, stageHeight);
                        } else {
                            const zoom = stageWidth / VIEWPORT_SIZE;
                            this._ctx.translate(x, y);
                            this._ctx.scale(zoom, zoom);
                            const pattern = this._ctx.createPattern(imageElement.image, "repeat");
                            if (pattern) {
                                this._ctx.rect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE * VIEWRATIO);
                                this._ctx.fillStyle = pattern;
                                this._ctx.fill();
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
