import { ElementAnimation } from "../stage/animation";

export class ScreenElementAnimation extends ElementAnimation {
    public start() {
        // 设置动画是否正在执行的参数为 true
        this.stageConfig.isElementAnimation = true;

        // 重置动画执行时间 和 动画执行时长
        this.stageConfig.animationTime = new Date().getTime();
        this.stageConfig.animationCountTime = 0;

        // 触发动画执行函数
        this.action();
    }

    public render() {
        this.stageConfig.resetCheckDrawView();
    }

    public stop() {
        // 设置动画是否正在执行的参数为 false
        this.stageConfig.isElementAnimation = false;

        // 根据动画执行的索引处理需要隐藏元素ID集合
        const animations = this.stageConfig.getAnimations();
        const inElIds: string[] = [];
        const outElIds: string[] = [];
        animations
            .slice(this.stageConfig.animationIndex + 1)
            .forEach((animation) => {
                const inIndex = inElIds.indexOf(animation.elId);
                const outIndex = outElIds.indexOf(animation.elId);
                if (
                    animation.type === "in" &&
                    inIndex === -1 &&
                    outIndex === -1
                ) {
                    inElIds.push(animation.elId);
                } else if (animation.type === "out" && outIndex === -1) {
                    outElIds.push(animation.elId);
                }
            });

        // 已经执行过的动画的，需要隐藏的元素ID集合
        const actionOutElIds: string[] = [];
        animations
            .slice(0, this.stageConfig.animationIndex + 1)
            .forEach((animation) => {
                const outIndex = actionOutElIds.indexOf(animation.elId);
                if (
                    animation.type === "out" &&
                    outIndex === -1
                ) {
                    actionOutElIds.push(animation.elId);
                } else if (animation.type === "in" && outIndex > -1) {
                    actionOutElIds.splice(outIndex, 1);
                }
            });

        // 设置需要隐藏的元素ID集合取并集
        this.stageConfig.animationHideElements = inElIds.concat(actionOutElIds.filter(id => !inElIds.includes(id)));

        // 清空当前执行动画存储集合
        this.stageConfig.actionAnimations = [];

        // 重置动画执行时长
        this.stageConfig.animationCountTime = 0;

        // 等待一帧后执行渲染 切换页会导致有问题 去除暂时不影响，后续待观察
        // window.requestAnimationFrame(() => this.render());
    }
}
