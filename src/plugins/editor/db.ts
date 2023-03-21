import { ISlide } from "@/types/slide";
import { IDBPDatabase, openDB } from "idb";
import { OPTION_TYPE } from "../config/options";
import { IHistory } from "@/types";

const DB_NAME = "CANVAS_PPT_DB";

export default class DB {
    private db: IDBPDatabase | undefined;
    async init() {
        if (!this.db) {
            this.db = await openDB(DB_NAME, 1, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains("history")) {
                        const objectStore = db.createObjectStore("history", {
                            keyPath: "id",
                            autoIncrement: true
                        });
                        objectStore.createIndex("id", "id", {
                            unique: true
                        });
                    }
                }
            });
        }
    }

    async delete(keys: number[]) {
        if (!this.db) await this.init();
        for (const key of keys) {
            await this.db!.transaction("history", "readwrite").objectStore("history").delete(key);
        }
    }

    async getData(key: number) {
        if (!this.db) await this.init();
        return await this.db!.transaction("history").objectStore("history").get(key) as IHistory;
    }

    async getAllKeys() {
        if (!this.db) await this.init();
        return await this.db!.transaction("history").objectStore("history").getAllKeys();
    }

    async setData(slideId: string, slides: ISlide[], optionType?: OPTION_TYPE) {
        if (!this.db) await this.init();
        this.db!.transaction("history", "readwrite")
            .objectStore("history")
            .add({ optionType, slideId, slides: JSON.parse(JSON.stringify(slides)) });
    }
}
