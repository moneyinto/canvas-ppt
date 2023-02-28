import Listener from "../listener";
import StageConfig from "../stage/config";
import DB from "./db";
import { ISlide } from "../types/slide";

interface IStorage {
    slideId: string;
    data: string;
}

export class History {
    public storage: IStorage[] = []; // 快照存储 暂时放在缓存中，后面移到db中
    public cursor = -1; // 快照指针
    private _stageConfig: StageConfig;
    private _listener: Listener;
    private _db: DB;
    private _snapshotKeys: number[];
    constructor(stageConfig: StageConfig, listener: Listener) {
        this._stageConfig = stageConfig;
        this._listener = listener;
        this._db = new DB();
        this._snapshotKeys = [];
    }

    public async getHistorySnapshot() {
        this._snapshotKeys = (await this._db.getAllKeys() || []) as number[];
        if (!this._snapshotKeys || this._snapshotKeys.length === 0) {
            await this.add();
        }
        const history = await this._db.getData(this._snapshotKeys[this._snapshotKeys.length - 1] as number);
        this.cursor = this._snapshotKeys.length - 1;
        return history.slides as ISlide[];
    }

    public async add() {
        const data = this._stageConfig.slides;
        const history = await this._db.getData(this._snapshotKeys.length === 0 ? -1 : this._snapshotKeys[this.cursor]);
        // 存储值与当前操作变化值相等，则没变化，阻断操作
        if (history && JSON.stringify(data) === JSON.stringify(history.slides)) return;

        if (this.cursor > -1 && this.cursor < this.length - 1) {
            // 移除指针后面的数据
            await this._db.delete(this._snapshotKeys.slice(this.cursor + 1));
        }

        // 获取当前编辑页，存储历史记录时，存入变化的页ID
        const currentSlide = this._stageConfig.getCurrentSlide();

        await this._db.setData(currentSlide!.id, data);

        this._snapshotKeys = (await this._db.getAllKeys() || []) as number[];
        this.cursor++;
        this._listener.onEditChange && this._listener.onEditChange(this.cursor, this.length, currentSlide!.id);
    }

    get length() {
        return this._snapshotKeys.length;
    }

    // 清理
    public async clear() {
        await this._db.delete(this._snapshotKeys);
        this._snapshotKeys = [];
        this.cursor = -1;
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
    private async _setSlides() {
        const history = await this._db.getData(this._snapshotKeys[this.cursor]);
        const slides = history.slides as ISlide[];
        this._stageConfig.setSildes(slides);
        this._stageConfig.resetCheckDrawView();
        // oprateElements存在时，这里需要验证一下oprateElements是否还在slides中
        const operateElements = this._stageConfig.operateElements;
        if (operateElements.length > 0) {
            const currentSlide = this._stageConfig.getCurrentSlide();
            const elements = currentSlide?.elements.filter(element => operateElements.findIndex(ele => element.id === ele.id) !== -1);
            this._stageConfig.updateOperateElements(elements?.length === operateElements.length ? elements : []);
            this._stageConfig.resetCheckDrawOprate();
        }
        this._stageConfig.hideCursor && this._stageConfig.hideCursor();
        this._listener.onEditChange && this._listener.onEditChange(this.cursor, this.length, history.slideId as string);
    }
}
