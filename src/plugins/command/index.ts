import StageConfig from "../stage/config";

export default class Command {
    private _stageConfig: StageConfig;
    constructor(stageConfig: StageConfig) {
        this._stageConfig = stageConfig;
    }

    public getZoom() {
        return this._stageConfig.zoom;
    }

    // 适配
    public excuteFitZoom() {
        this._stageConfig.resetBaseZoom();
    }

    // 缩小
    public executeDecrease() {
        const minZoom = this._stageConfig.getZoom();
        const zoom = this.getZoom();

        if (zoom - 0.05 >= minZoom) {
            this._stageConfig.setZoom(zoom - 0.05);
        } else if (zoom > minZoom) {
            this._stageConfig.setZoom(minZoom);
        }
    }

    // 放大
    public executeIncrease() {
        const zoom = this.getZoom();

        // 考虑是否要加上限
        this._stageConfig.setZoom(zoom + 0.05);
    }
}
