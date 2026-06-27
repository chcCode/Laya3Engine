export interface ConfigTable<T> {
    /** 表内所有配置行。 */
    readonly list: T[];
    /** 按 id 获取配置；找不到返回 undefined。 */
    get(id: number | string): T | undefined;
    /** 按 id 获取配置；找不到时抛出错误。 */
    require(id: number | string): T;
}

/** 通用配置加载器，负责把 Luban JSON 解析成按 id 查询的配置表。 */
export class ConfigManager {
    private readonly tables = new Map<string, ConfigTable<any>>();

    /** 加载配置表，默认路径为 resources/config/json/{name}.json。 */
    async loadTable<T extends { id: number | string }>(name: string, url?: string): Promise<ConfigTable<T>> {
        const path = url || `resources/config/json/${name}.json`;
        const raw = await Laya.loader.load(path, undefined, undefined, Laya.Loader.JSON);
        const rows = this.resolveRows<T>(raw);
        const table = this.createTable(name, rows);
        this.tables.set(name, table);
        return table;
    }

    /** 获取已加载的配置表；未加载时抛出错误。 */
    getTable<T>(name: string): ConfigTable<T> {
        const table = this.tables.get(name);
        if (!table) {
            throw new Error(`Config table is not loaded: ${name}`);
        }

        return table as ConfigTable<T>;
    }

    /** 判断配置表是否已加载。 */
    hasTable(name: string): boolean {
        return this.tables.has(name);
    }

    /** 清空全部已加载配置表缓存。 */
    clear(): void {
        this.tables.clear();
    }

    private resolveRows<T>(raw: any): T[] {
        if (!raw) return [];

        // Laya 3 的 Loader.JSON 可能返回 TextResource，真实 JSON 在 data 字段中。
        if (typeof raw === "string") {
            return this.resolveRows<T>(JSON.parse(raw));
        }
        if (typeof raw?.text === "string") {
            return this.resolveRows<T>(JSON.parse(raw.text));
        }
        if (typeof raw?.data === "string") {
            return this.resolveRows<T>(JSON.parse(raw.data));
        }
        if (raw?.data && typeof raw.data === "object") {
            const rows = this.resolveRows<T>(raw.data);
            if (rows.length > 0) return rows;
        }
        if (Array.isArray(raw)) return raw as T[];
        if (Array.isArray(raw?.dataList)) return raw.dataList as T[];
        if (Array.isArray(raw?.list)) return raw.list as T[];
        if (typeof raw === "object") {
            const rows: T[] = [];
            for (const key in raw) {
                const row = raw[key];
                if (row && typeof row === "object") {
                    // 兼容 map 结构导出：key 作为配置 id。
                    if (row.id === undefined) {
                        row.id = key;
                    }
                    rows.push(row as T);
                }
            }
            return rows;
        }

        return [];
    }

    private createTable<T extends { id: number | string }>(name: string, rows: T[]): ConfigTable<T> {
        const map = new Map<number | string, T>();

        for (const row of rows) {
            this.setRow(map, row.id, row);
        }

        return {
            list: rows,
            get: (id: number | string): T | undefined => map.get(id),
            require: (id: number | string): T => {
                const row = map.get(id);
                if (!row) {
                    throw new Error(`Config row not found: ${name}.${String(id)}`);
                }

                return row;
            },
        };
    }

    private setRow<T>(map: Map<number | string, T>, id: number | string, row: T): void {
        // 同时登记 number 和 string key，避免 CSV/JSON 类型差异导致查不到。
        map.set(id, row);
        map.set(String(id), row);

        if (typeof id === "string") {
            const numberId = Number(id);
            if (!Number.isNaN(numberId)) {
                map.set(numberId, row);
            }
        }
    }
}
