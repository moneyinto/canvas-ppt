import History from "@/plugins/editor/history";
import { IPPTChartElement, IPPTImageElement, IPPTLatexElement } from "@/types/element";
import StageConfig from "../config";
import { Shadow } from "./shadow";
import { Fill } from "./fill";
import { OutLine } from "./outline";
import { getShapePath } from "@/utils/shape";
import { SHAPE_TYPE } from "@/plugins/config/shapes";
import { defaultImageSrc } from "@/plugins/config";
import Animation from "./animation";

export class Picture {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _history: History;
    private _shadow: Shadow;
    private _fill: Fill;
    private _outline: OutLine;
    private _animation: Animation;
    constructor(
        stageConfig: StageConfig,
        ctx: CanvasRenderingContext2D,
        history: History
    ) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._history = history;
        this._shadow = new Shadow(this._ctx);
        this._fill = new Fill(this._ctx);
        this._outline = new OutLine(this._ctx);
        this._animation = new Animation(stageConfig, ctx);
    }

    private async _getCacheImage(element: IPPTImageElement | IPPTLatexElement | IPPTChartElement): Promise<HTMLImageElement> {
        return new Promise(resolve => {
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
                    this._history.getFile(element.src).then(file => {
                        image.src = file || defaultImageSrc;
                    });
                } catch {
                    image.src = defaultImageSrc;
                }
            }
        });
    }

    public async draw(element: IPPTImageElement | IPPTLatexElement | IPPTChartElement) {
        const cacheImage = await this._getCacheImage(element);
        if (cacheImage) {
            const image = cacheImage;
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
            // 水平垂直翻转
            this._ctx.scale(element.flipH || 1, element.flipV || 1);

            // 动画
            this._animation.setElementStatus(element);

            const path = getShapePath(SHAPE_TYPE.RECT, element.width, element.height) as Path2D;
            if (element.fill) {
                this._fill.draw(element.fill, path);
            }

            if (element.outline) {
                this._outline.draw(element.outline, path);
            }

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
