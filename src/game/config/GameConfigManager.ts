import { ConfigManager, ConfigTable } from "../../framework";
import type { ItemConfig } from "./ItemConfig";

/** 游戏侧配置门面，业务代码只通过这里访问具体配置表。 */
export class GameConfigManager {
    private itemTable?: ConfigTable<ItemConfig>;

    constructor(private readonly configs: ConfigManager) {
    }

    async loadAll(): Promise<void> {
        // 新增配置表时统一在这里加载，避免业务模块散落表名字符串。
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
