import StageConfig from "../stage/config";

export default class Animation {
    public stageConfig: StageConfig;
    constructor(stageConfig: StageConfig) {
        this.stageConfig = stageConfig;
    }

    public start() {
        // 设置动画是否正在执行的参数为 true
        this.stageConfig.isAnimation = true;

        // 重置动画执行时间 和 动画执行时长
        this.stageConfig.animationTime = new Date().getTime();
        this.stageConfig.animationCountTime = 0;

        // 触发动画执行函数
        this.action();
    }

    public render() {
        this.stageConfig.resetCheckDrawView();
    }

    public action() {
        // 判断动画是执行中的，执行中则进行一下步骤，否则跳过不做处理
        if (this.stageConfig.isAnimation && this.stageConfig.actionAnimations.length > 0) {
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

    public stop() {
        // 设置动画是否正在执行的参数为 false
        this.stageConfig.isAnimation = false;

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

        // 等待一帧后执行渲染
        window.requestAnimationFrame(() => this.render());
    }
}
