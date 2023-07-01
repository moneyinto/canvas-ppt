import { ElementAnimation } from "../stage/animation";
import StageConfig from "../stage/config";
import Listener from "./listener";

export default class Animation extends ElementAnimation {
    private _listener: Listener;
    constructor(stageConfig: StageConfig, listener: Listener) {
        super(stageConfig);
        this._listener = listener;
    }

    public render() {
        this.stageConfig.resetCheckDrawOprate();
        this.stageConfig.resetCheckDrawView();
    }

    public stop() {
        // 设置动画是否正在执行的参数为 false
        this.stageConfig.isElementAnimation = false;

        // 设置需要隐藏的元素ID集合取并集
        this.stageConfig.animationHideElements = [];

        // 清空当前执行动画存储集合
        this.stageConfig.actionAnimations = [];

        // 重置动画执行时长
        this.stageConfig.animationCountTime = 0;

        // 等待一帧后执行渲染
        window.requestAnimationFrame(() => this.render());
    }

    public emitStop() {
        this._listener.onAnimationsEnd();
    }
}
