import Command from "./command";
import Listener from "./listener";
import Shortcut from "../shortCut";
import StageConfig from "../stage/config";
import ControlStage from "./control";
import Cursor from "./cursor";
import Textarea from "./textarea";
import ViewStage from "./view";
import { ISlide } from "@/types/slide";
import History from "./history";
import { throttleRAF } from "@/utils";
import DB from "@/utils/db";

export default class Editor {
    public listener: Listener;
    public command: Command;
    public stageConfig: StageConfig;
    public history: History;

    private _cursor: Cursor;
    private _textarea: Textarea;
    private _viewStage: ViewStage;
    private _controlStage: ControlStage;
    private _resizeObserver: ResizeObserver | null;
    private _container: HTMLDivElement;

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
        this.stageConfig.resetDrawView = () => this._viewStage.resetDrawPage();
        this.stageConfig.resetDrawOprate = () => this._controlStage.resetDrawOprate();
        this.stageConfig.hideCursor = () => this._controlStage.hideCursor();
        this.stageConfig.getFontSize = (text) => {
            return this._controlStage.getFontSize(text);
        };

        this.stageConfig.setSlides(slides);
        if (slides.length > 0) this.stageConfig.setSlideId(slides[0].id);

        const db = new DB();
        // 历史数据
        this.history = new History(this.stageConfig, this.listener, db);

        this._textarea = new Textarea(container);
        this._cursor = new Cursor(container, this._textarea, this.stageConfig);

        // 命令
        this.command = new Command(this.stageConfig, this.listener, this.history, this._cursor);

        // 创建展示画板
        this._viewStage = new ViewStage(container, this.stageConfig, db);

        // 创建操作画板
        this._controlStage = new ControlStage(
            container,
            this.stageConfig,
            db,
            this.command,
            this._cursor,
            this._textarea,
            this.listener
        );

        this._container = container;
        this._resizeObserver = new ResizeObserver(throttleRAF(this._reset.bind(this)));
        this._resizeObserver.observe(container);
        // window.addEventListener("resize", throttleRAF(this._reset.bind(this)));

        // 快捷键
        // eslint-disable-next-line
        new Shortcut(container, this.stageConfig, this.command);
    }

    private _reset() {
        this._controlStage.resetStage();
        this._viewStage.resetStage();

        this.stageConfig.resetBaseZoom();
    }

    public destory() {
        this._resizeObserver?.unobserve(this._container);
    }
}
