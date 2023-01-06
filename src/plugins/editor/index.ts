import Command from "../command";
import Listener from "../listener";
import Shortcut from "../shortCut";
import StageConfig from "../stage/config";
import ControlStage from "../stage/control";
import ViewStage from "../stage/view";

export default class Editor {
    public listener: Listener;
    public command: Command;

    private _stageConfig: StageConfig;
    private _viewStage: ViewStage;
    constructor(container: HTMLDivElement) {
        // 监听
        this.listener = new Listener();

        // 画板配置
        this._stageConfig = new StageConfig(container, this.listener);
        this._stageConfig.resetDraw = () => {
            this._resetDraw();
        };

        // 命令
        this.command = new Command(this._stageConfig);

        // 创建展示画板
        this._viewStage = new ViewStage(container, this.listener, this._stageConfig);

        // 创建操作画板
        const controlStage = new ControlStage(container, this.listener, this._stageConfig, this.command);

        // 快捷键
        const shortcut = new Shortcut(container, this.command);
    }

    private _resetDraw() {
        this._viewStage.resetDrawPage();
    }
}
