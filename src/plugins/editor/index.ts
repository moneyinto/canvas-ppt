import Command from "../command";
import Listener from "../listener";
import Shortcut from "../shortCut";
import StageConfig from "../stage/config";
import ControlStage from "../stage/control";
import ViewStage from "../stage/view";
import { ISlide } from "../types/slide";

export default class Editor {
    public listener: Listener;
    public command: Command;
    public stageConfig: StageConfig;

    private _viewStage: ViewStage;
    constructor(container: HTMLDivElement, slides: ISlide[]) {
        // 监听
        this.listener = new Listener();

        // 画板配置
        this.stageConfig = new StageConfig(container, this.listener);
        this.stageConfig.resetDraw = () => {
            this._resetDraw();
        };
        this.stageConfig.setSildes(slides);
        if (slides.length > 0) this.stageConfig.setSlideId(slides[0].id);

        // 命令
        this.command = new Command(this.stageConfig);

        // 创建展示画板
        this._viewStage = new ViewStage(container, this.listener, this.stageConfig);

        // 创建操作画板
        const controlStage = new ControlStage(container, this.listener, this.stageConfig, this.command);

        // 快捷键
        const shortcut = new Shortcut(container, this.listener, this.stageConfig, this.command);
    }

    private _resetDraw() {
        this._viewStage.resetDrawPage();
    }
}
