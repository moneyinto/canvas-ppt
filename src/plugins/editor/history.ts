import Listener from "../listener";
import StageConfig from "../stage/config";
import { ISlide } from "../types/slide";

export class History {
    public storage: string[] = []; // 快照存储 暂时放在缓存中，后面移到db中
    public cursor = -1; // 快照指针
    private _stageConfig: StageConfig;
    private _listener: Listener;
    constructor(stageConfig: StageConfig, listener: Listener) {
        this._stageConfig = stageConfig;
        this._listener = listener;
    }

    public add(data: string) {
        if (this.cursor > -1 && this.cursor < this.length - 1) {
            // 移除指针后面的数据
            this.storage = this.storage.slice(0, this.cursor + 1);
        }

        this.storage.push(data);
        this.cursor++;
        this._listener.onEditChange && this._listener.onEditChange(this.cursor, this.length);
    }

    get length() {
        return this.storage.length;
    }

    // 恢复
    public redo() {
        if (this.cursor < this.length - 1) {
            this.cursor++;
            this._setSlides();
        }
    }

    // 撤销
    public undo() {
        if (this.cursor > 0) {
            this.cursor--;
            this._setSlides();
        }
    }

    // 展示数据
    private _setSlides() {
        const slides: ISlide[] = JSON.parse(this.storage[this.cursor]);
        this._stageConfig.setSildes(slides);
        this._stageConfig.resetDraw && this._stageConfig.resetDraw();
        this._listener.onEditChange && this._listener.onEditChange(this.cursor, this.length);
    }
}
