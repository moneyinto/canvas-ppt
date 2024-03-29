import { IPPTChartElement, IPPTImageElement, IPPTLatexElement } from "@/types/element";
import StageConfig from "./config";
import Shadow from "./shadow";
import Fill from "./fill";
import OutLine from "./outline";
import { getShapePath } from "@/utils/shape";
import { SHAPE_TYPE } from "@/config/shapes";
import { defaultImageSrc } from "@/config";
import { ActionAnimation } from "./animation";
import DB from "@/utils/db";

export default class Picture {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    private _db: DB;
    private _shadow: Shadow;
    private _fill: Fill;
    private _outline: OutLine;
    private _actionAnimation: ActionAnimation;
    constructor(
        stageConfig: StageConfig,
        ctx: CanvasRenderingContext2D,
        db: DB
    ) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
        this._db = db;
        this._shadow = new Shadow(this._ctx);
        this._fill = new Fill(this._ctx);
        this._outline = new OutLine(this._ctx);
        this._actionAnimation = new ActionAnimation(stageConfig, ctx);
    }

    private _getCacheImage(element: IPPTImageElement | IPPTLatexElement | IPPTChartElement): HTMLImageElement | undefined {
        const cacheImage = window.cacheDomMap.get(element.src);
        if (cacheImage) {
            return cacheImage as HTMLImageElement;
        } else {
            const image = new Image();
            image.onload = () => {
                window.cacheDomMap.set(element.src, image);
                this._stageConfig.waitDrawView();
            };
            try {
                this._db.getFile(element.src).then(file => {
                    image.src = file || defaultImageSrc;
                });
            } catch {
                image.src = defaultImageSrc;
            }
        }
        return undefined;
    }

    public draw(element: IPPTImageElement | IPPTLatexElement | IPPTChartElement) {
        const cacheImage = this._getCacheImage(element);
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
            this._actionAnimation.setElementStatus(element);

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
