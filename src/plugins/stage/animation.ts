import { getAnimationStatus } from "@/config/animationStatus";
import StageConfig from "./config";
import { IPPTElement } from "@/types/element";
import { IPPTTurningAnimation, ISlide } from "@/types/slide";
import Stage from ".";
import Background from "./background";

/**
 * 动画执行状态控制
 */
export class ActionAnimation {
    private _stageConfig: StageConfig;
    private _ctx: CanvasRenderingContext2D;
    constructor(stageConfig, ctx) {
        this._stageConfig = stageConfig;
        this._ctx = ctx;
    }

    public setElementStatus(element: IPPTElement) {
        if (this._stageConfig.isElementAnimation && this._stageConfig.actionAnimations.length > 0) {
            const actionAnimation = this._stageConfig.actionAnimations[0].find((item) => item.elId === element.id);
            if (actionAnimation) {
                // 存在则执行动画绘制
                const process = Math.min(this._stageConfig.animationCountTime / actionAnimation.duration * 100, 100);
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

    public setSlideStatus(turningAni?: IPPTTurningAnimation) {
        if (this._stageConfig.isTurningAnimation && turningAni) {
            // 存在则执行动画绘制
            const process = this._stageConfig.animationCountTime / turningAni.duration * 100;
            const { stageWidth: width, stageHeight: height } = this._stageConfig.getStageArea();

            // 坐标原点平移到画布中心位置
            this._ctx.translate(width / 2, height / 2);

            const { translate, scale, opacity, rotate, skew } = getAnimationStatus(turningAni.ani, process, width, height);

            if (
                turningAni.ani === "rotateInDownLeft" ||
                turningAni.ani === "rotateInUpLeft" ||
                turningAni.ani === "rotateOutDownLeft" ||
                turningAni.ani === "rotateOutUpLeft" ||
                turningAni.ani === "hinge"
            ) {
                this._ctx.translate(-width / 2, height / 2);
            } else if (
                turningAni.ani === "rotateInDownRight" ||
                turningAni.ani === "rotateInUpRight" ||
                turningAni.ani === "rotateOutDownRight" ||
                turningAni.ani === "rotateOutUpRight"
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

            // 坐标原点有中心位置平移回去
            this._ctx.translate(-width / 2, -height / 2);
        }
    }
}

/**
 * 元素动画执行方法
 */
export class ElementAnimation {
    public stageConfig: StageConfig;
    constructor(stageConfig: StageConfig) {
        this.stageConfig = stageConfig;
    }

    public start() {}

    public render() {}

    public action() {
        // 判断动画是执行中的，执行中则进行一下步骤，否则跳过不做处理
        if (this.stageConfig.isElementAnimation && this.stageConfig.actionAnimations.length > 0) {
            // 取当前执行动画存储集合的第一个，进行判断修改需要隐藏元素ID集合
            const animations = this.stageConfig.actionAnimations[0];
            const inElIds = animations.filter((animation) => animation.type === "in").map((animation) => animation.elId);
            this.stageConfig.animationHideElements = this.stageConfig.animationHideElements.filter((elId) => inElIds.indexOf(elId) === -1);

            // 根据动画执行时间，算出动画执行的时长
            this.stageConfig.animationCountTime = new Date().getTime() - this.stageConfig.animationTime;

            // 触发渲染函数方法
            this.render();

            // 根据动画执行的时长来判断当前执行动画存储集合的第一个是否有动画执行完成（动画的时间小于等于动画执行时长）
            // 如果动画为退出动画，这里需要将元素ID加入到需要隐藏元素ID集合
            // 进行完成动画的删除
            const outElIds = animations.filter(animation => animation.duration <= this.stageConfig.animationCountTime && animation.type === "out").map(animation => animation.elId);
            this.stageConfig.animationHideElements = this.stageConfig.animationHideElements.concat(outElIds);
            this.stageConfig.actionAnimations[0] = animations.filter(animation => animation.duration > this.stageConfig.animationCountTime);

            // 判断当前执行动画存储集合的第一个是否全部执行完成（即长度为 0），如果全部执行完，清除当前执行动画存储集合的第一个的删除，重置动画执行时间和动画执行时长
            if (this.stageConfig.actionAnimations[0].length === 0) {
                this.stageConfig.actionAnimations.shift();
                this.stageConfig.animationTime = new Date().getTime();
                this.stageConfig.animationCountTime = 0;
            }

            // 判断整个当前执行动画存储集合是否执行完成（即长度为0），结束动画执行（触发动画终止函数），否则继续触发动画执行函数，采用window.requestAnimationFrame
            if (this.stageConfig.actionAnimations.length === 0) {
                this.stop();
                this.emitStop();
            } else {
                window.requestAnimationFrame(() => this.action());
            }
        }
    }

    public emitStop() {}

    public stop() {}
}

/**
 * 页面切换动画类
 */

export class PageAnimation {
    public stageConfig: StageConfig;
    private _animationStage: Stage;
    private _animationBackground: Background;
    private _actionAnimation: ActionAnimation;
    constructor(stageConfig: StageConfig, animationStage: Stage, animationBackground: Background) {
        this.stageConfig = stageConfig;
        this._animationStage = animationStage;
        this._animationBackground = animationBackground;

        this._actionAnimation = new ActionAnimation(stageConfig, this._animationStage.ctx);
    }

    public start(slide: ISlide, endCallback: () => void) {
        this._animationStage.clear();
        if (slide.turningAni) {
            // 设置动画是否正在执行的参数为 true
            this.stageConfig.isTurningAnimation = true;

            // 重置动画执行时间 和 动画执行时长
            this.stageConfig.animationTime = new Date().getTime();
            this.stageConfig.animationCountTime = 0;

            this.stageConfig.turningAni = slide.turningAni;

            // 触发动画执行函数
            this.action(slide, endCallback);
        } else {
            endCallback();
        }
    }

    public render(slide: ISlide) {
        this._animationStage.clear();

        this._animationStage.ctx.save();

        this._actionAnimation.setSlideStatus(slide.turningAni);

        this._animationBackground.draw(slide.background);
        this._animationStage.drawElements(slide.elements);

        this._animationStage.ctx.restore();
    }

    public async action(slide: ISlide, endCallback: () => void) {
        if (this.stageConfig.isTurningAnimation) {
            // 根据动画执行时间，算出动画执行的时长
            this.stageConfig.animationCountTime = new Date().getTime() - this.stageConfig.animationTime;

            // 判断整个当前执行动画存储集合是否执行完成（即长度为0），结束动画执行（触发动画终止函数），否则继续触发动画执行函数，采用window.requestAnimationFrame
            if (this.stageConfig.animationCountTime >= this.stageConfig.turningAni!.duration) {
                this.stop();
                endCallback();
            } else {
                // 触发渲染函数方法
                this.render(slide);
                window.requestAnimationFrame(() => this.action(slide, endCallback));
            }
        } else {
            endCallback();
        }
    }

    public stop() {
        // 设置动画是否正在执行的参数为 false
        this.stageConfig.isTurningAnimation = false;

        // 重置切页动画
        this.stageConfig.turningAni = null;

        // 重置动画执行时长
        this.stageConfig.animationCountTime = 0;

        this._animationStage.clear();
    }
}
