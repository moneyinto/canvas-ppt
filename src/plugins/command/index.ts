import StageConfig from "../stage/config";

export default class Command {
    private _stageConfig: StageConfig;
    constructor(stageConfig: StageConfig) {
        this._stageConfig = stageConfig;
    }

    public getZoom() {
        return this._stageConfig.zoom;
    }
}
