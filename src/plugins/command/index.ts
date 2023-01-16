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
        const minZoom = this._stageConfig.getFitZoom();
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

    // 删除元素
    public excuteDelete() {
        const operateElement = this._stageConfig.operateElement;
        if (operateElement) {
            const slide = this._stageConfig.getCurrentSlide();
            const index = slide?.elements.findIndex(element => element.id === operateElement.id);
            if (typeof index !== "undefined" && index > -1) {
                slide?.elements.splice(index, 1);
                this._stageConfig.setOperateElement(null);
                this._stageConfig.resetCheckDrawOprate();
                this._stageConfig.resetCheckDrawView();
            }
        }
    }
}
