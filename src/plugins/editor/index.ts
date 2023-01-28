import Command from "../command";
import Listener from "../listener";
import Shortcut from "../shortCut";
import StageConfig from "../stage/config";
import ControlStage from "../stage/control";
import ViewStage from "../stage/view";
import { ISlide } from "../types/slide";
import { History } from "./history";

export default class Editor {
    public listener: Listener;
    public command: Command;
    public stageConfig: StageConfig;
    public history: History;

    private _viewStage: ViewStage;
    private _controlStage: ControlStage;
    constructor(container: HTMLDivElement, slides: ISlide[]) {
        document.oncontextmenu = (event: Event) => {
            event.preventDefault();
        };
        // 监听
        this.listener = new Listener();

        // 画板配置
        this.stageConfig = new StageConfig(container, this.listener);
        this.stageConfig.resetDrawView = () => {
            this._viewStage.resetDrawPage();
        };
        this.stageConfig.resetDrawOprate = () => {
            this._controlStage.resetDrawOprate();
        };

        this.stageConfig.setSildes(slides);
        if (slides.length > 0) this.stageConfig.setSlideId(slides[0].id);

        // 历史数据
        this.history = new History(this.stageConfig, this.listener);
        this.history.add();

        // 命令
        this.command = new Command(this.stageConfig);

        // 创建展示画板
        this._viewStage = new ViewStage(container, this.listener, this.stageConfig);

        // 创建操作画板
        this._controlStage = new ControlStage(container, this.listener, this.stageConfig, this.command, this.history);

        // 快捷键
        const shortcut = new Shortcut(container, this.listener, this.stageConfig, this.command);
    }
}
