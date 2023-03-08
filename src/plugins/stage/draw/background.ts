import { VIEWPORT_SIZE, VIEWRATIO } from "@/plugins/config/stage";
import { ISlideBackground } from "@/plugins/types/slide";
import StageConfig from "../config";

export default class Background {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    constructor(stageConfig: StageConfig, ctx: CanvasRenderingContext2D) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
    }

    private _getCacheImage(url: string): Promise<HTMLImageElement> {
        return new Promise(resolve => {
            const cacheImage = this._stageConfig.cacheBackgroundImage;
            if (cacheImage) {
                resolve(cacheImage);
            } else {
                const image = new Image();
                image.onload = () => {
                    this._stageConfig.updateBackgroundImage(image);
                    resolve(image);
                };
                image.src = url;
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
                    break;
                }
                case "gradient": {
                    // 背景渐变色
                    this._ctx.translate(x, y);
                    const linear: [number, number, number, number] = [stageWidth / 2, 0, stageWidth / 2, stageHeight];
                    const radial: [number, number, number, number, number, number] = [stageWidth / 2, stageHeight / 2, 0, stageWidth / 2, stageHeight / 2, stageWidth / 2];
                    const rotate = background.gradientRotate || 0;
                    const startColor = background.gradientColor ? background.gradientColor[0] : "#ffffff";
                    const endColor = background.gradientColor ? background.gradientColor[1] : "#ffffff";
                    if (rotate > 0 && background.gradientType === "linear") {
                        const angle = Math.atan(9 / 16);
                        const currentAngle = Math.PI / 180 * rotate;
                        if (angle >= currentAngle) {
                            const offsetX = Math.tan(rotate / 180 * Math.PI) * stageHeight / 2;
                            linear[0] = linear[0] + offsetX;
                            linear[2] = linear[2] - offsetX;
                        } else if (angle < currentAngle && currentAngle <= Math.PI / 2 - angle) {
                            const offsetY = Math.tan(Math.PI / 2 - currentAngle) * stageWidth / 2;
                            linear[0] = stageWidth;
                            linear[1] = stageHeight / 2 - offsetY;
                            linear[2] = 0;
                            linear[3] = stageHeight / 2 + offsetY;
                        } else if (currentAngle > Math.PI / 2 && currentAngle <= Math.PI - angle) {
                            const offsetY = Math.tan(currentAngle - Math.PI / 2) * stageWidth / 2;
                            linear[0] = stageWidth;
                            linear[1] = stageHeight / 2 + offsetY;
                            linear[2] = 0;
                            linear[3] = stageHeight / 2 - offsetY;
                        } else if (currentAngle <= Math.PI && currentAngle > Math.PI - angle) {
                            const offsetX = Math.tan(Math.PI - currentAngle) * stageHeight / 2;
                            linear[0] = stageWidth / 2 + offsetX;
                            linear[1] = stageHeight;
                            linear[2] = stageWidth / 2 - offsetX;
                            linear[3] = 0;
                        } else if (currentAngle > Math.PI && currentAngle <= Math.PI + angle) {
                            const offsetX = Math.tan(currentAngle - Math.PI) * stageHeight / 2;
                            linear[0] = stageWidth / 2 - offsetX;
                            linear[1] = stageHeight;
                            linear[2] = stageWidth / 2 + offsetX;
                            linear[3] = 0;
                        } else if (currentAngle > Math.PI + angle && currentAngle <= Math.PI * 3 / 2) {
                            const offsetY = Math.tan(Math.PI * 3 / 2 - currentAngle) * stageWidth / 2;
                            linear[0] = 0;
                            linear[1] = stageHeight / 2 + offsetY;
                            linear[2] = stageWidth;
                            linear[3] = stageHeight / 2 - offsetY;
                        } else if (currentAngle > Math.PI * 3 / 2 && currentAngle <= Math.PI * 2 - angle) {
                            const offsetY = Math.tan(currentAngle - Math.PI * 3 / 2) * stageWidth / 2;
                            linear[0] = 0;
                            linear[1] = stageHeight / 2 - offsetY;
                            linear[2] = stageWidth;
                            linear[3] = stageHeight / 2 + offsetY;
                        } else {
                            const offsetX = Math.tan(Math.PI * 2 - currentAngle) * stageHeight / 2;
                            linear[0] = stageWidth / 2 - offsetX;
                            linear[1] = 0;
                            linear[2] = stageWidth / 2 + offsetX;
                            linear[3] = stageHeight;
                        }
                    }
                    const gra = background.gradientType === "radial" ? this._ctx.createRadialGradient(...radial) : this._ctx.createLinearGradient(...linear);
                    gra.addColorStop(0, startColor);
                    gra.addColorStop(1, endColor);
                    this._ctx.fillStyle = gra;
                    this._ctx.fillRect(0, 0, stageWidth, stageHeight);
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
