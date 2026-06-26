import { ConfigManager, ConfigTable } from "../../framework";
import type { ItemConfig } from "./ItemConfig";

export class GameConfigManager {
    private itemTable?: ConfigTable<ItemConfig>;

    constructor(private readonly configs: ConfigManager) {
    }

    async loadAll(): Promise<void> {
        this.itemTable = await this.configs.loadTable<ItemConfig>("TbItemConfig");
    }

    get items(): readonly ItemConfig[] {
        return this.requireItemTable().list;
    }

    getItem(id: number | string): ItemConfig | undefined {
        return this.requireItemTable().get(id);
    }

    requireItem(id: number | string): ItemConfig {
        return this.requireItemTable().require(id);
    }

    private requireItemTable(): ConfigTable<ItemConfig> {
        if (!this.itemTable) {
            throw new Error("Game configs are not loaded. Call loadAll() first.");
        }

        return this.itemTable;
    }
}
