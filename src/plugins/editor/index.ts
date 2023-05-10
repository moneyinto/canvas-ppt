import Command from "../command";
import Listener from "../listener";
import Shortcut from "../shortCut";
import StageConfig from "../stage/config";
import ControlStage from "../stage/control";
import { Cursor } from "../stage/cursor";
import { Textarea } from "../stage/textarea";
import ViewStage from "../stage/view";
import { ISlide } from "@/types/slide";
import History from "./history";
import { debounce, throttleRAF } from "@/utils";

export default class Editor {
    public listener: Listener;
    public command: Command;
    public stageConfig: StageConfig;
    public history: History;

    private _cursor: Cursor;
    private _textarea: Textarea;
    private _viewStage: ViewStage;
    private _controlStage: ControlStage;

    constructor(container: HTMLDivElement, slides: ISlide[]) {
        // 禁止右击系统菜单
        document.oncontextmenu = (event: Event) => {
            event.preventDefault();
        };

        // 监听
        this.listener = new Listener();

        // 画板配置
        this.stageConfig = new StageConfig(container, this.listener, 40);
        // 防抖，减少渲染叠加
        this.stageConfig.resetDrawView = debounce(async () => {
            this._viewStage.resetDrawPage();
        }, 50);
        this.stageConfig.resetDrawOprate = () => {
            this._controlStage.resetDrawOprate();
        };
        this.stageConfig.hideCursor = () => {
            this._controlStage.hideCursor();
        };
        this.stageConfig.getFontSize = (text) => {
            return this._controlStage.getFontSize(text);
        };

        this.stageConfig.setSlides(slides);
        if (slides.length > 0) this.stageConfig.setSlideId(slides[0].id);

        // 历史数据
        this.history = new History(this.stageConfig, this.listener);

        this._textarea = new Textarea(container);
        this._cursor = new Cursor(container, this._textarea, this.stageConfig);

        // 命令
        this.command = new Command(this.stageConfig, this.listener, this.history, this._cursor);

        // 创建展示画板
        this._viewStage = new ViewStage(container, this.stageConfig, this.history);

        // 创建操作画板
        this._controlStage = new ControlStage(
            container,
            this.stageConfig,
            this.history,
            this.command,
            this._cursor,
            this._textarea,
            this.listener
        );

        window.addEventListener("resize", throttleRAF(this._reset.bind(this)));

        // 快捷键
        // eslint-disable-next-line
        new Shortcut(container, this.stageConfig, this.command);
    }

    private _reset() {
        this._controlStage.resetStage();
        this._viewStage.resetStage();

        this.stageConfig.resetBaseZoom();
    }
}
