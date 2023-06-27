import { getAnimationStatus } from "@/plugins/config/animationStatus";
import StageConfig from "../config";
import { IPPTElement } from "@/types/element";

export default class Animation {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    constructor(stageConfig, ctx) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
    }

    public setElementStatus(element: IPPTElement) {
        if (this._stageConfig.actionAnimations.length > 0) {
            const actionAnimation = this._stageConfig.actionAnimations[0].find((item) => item.elId === element.id);
            if (actionAnimation) {
                // 存在则执行动画绘制
                const process = this._stageConfig.animationCountTime / actionAnimation.duration * 100;
                const width = element.type === "line" ? Math.abs(element.end[0] - element.start[0]) : element.width;
                const height = element.type === "line" ? Math.abs(element.end[1] - element.start[1]) : element.height;
                const { translate, scale, opacity, rotate, skew } = getAnimationStatus(actionAnimation.ani, process, width, height);

                if (
                    actionAnimation.ani === "rotateInDownLeft" ||
                    actionAnimation.ani === "rotateInUpLeft" ||
                    actionAnimation.ani === "rotateOutDownLeft" ||
                    actionAnimation.ani === "rotateOutUpLeft" ||
                    actionAnimation.ani === "hinge"
                ) {
                    this._ctx.translate(-width / 2, height / 2);
                } else if (
                    actionAnimation.ani === "rotateInDownRight" ||
                    actionAnimation.ani === "rotateInUpRight" ||
                    actionAnimation.ani === "rotateOutDownRight" ||
                    actionAnimation.ani === "rotateOutUpRight"
                ) {
                    this._ctx.translate(width / 2, height / 2);
                }

                this._ctx.scale(...scale);
                this._ctx.translate(...translate);
                this._ctx.globalAlpha = opacity;
                this._ctx.rotate((rotate * Math.PI) / 180);
                this._ctx.transform(
                    1,
                    (skew[0] * Math.PI) / 180,
                    (skew[1] * Math.PI) / 180,
                    1,
                    0,
                    0
                );
            }
        }
    }
}
