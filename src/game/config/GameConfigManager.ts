import { ConfigManager, ConfigTable } from "../../framework";
import type { ItemConfig } from "./ItemConfig";

/** 游戏侧配置门面，业务代码只通过这里访问具体配置表。 */
export class GameConfigManager {
    private itemTable?: ConfigTable<ItemConfig>;

    constructor(private readonly configs: ConfigManager) {
    }

    /** 加载游戏启动所需的全部配置表。 */
    async loadAll(): Promise<void> {
        // 新增配置表时统一在这里加载，避免业务模块散落表名字符串。
        this.itemTable = await this.configs.loadTable<ItemConfig>("TbItemConfig");
    }

    /** 全部道具配置。 */
    get items(): readonly ItemConfig[] {
        return this.requireItemTable().list;
    }

    /** 可选获取道具配置，找不到返回 undefined。 */
    getItem(id: number | string): ItemConfig | undefined {
        return this.requireItemTable().get(id);
    }

    /** 必须获取道具配置，找不到会抛出错误。 */
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
