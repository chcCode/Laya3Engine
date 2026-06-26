export interface ConfigTable<T> {
    readonly list: T[];
    get(id: number | string): T | undefined;
    require(id: number | string): T;
}

export class ConfigManager {
    private readonly tables = new Map<string, ConfigTable<any>>();

    async loadTable<T extends { id: number | string }>(name: string, url?: string): Promise<ConfigTable<T>> {
        const path = url || `resources/config/json/${name}.json`;
        const raw = await Laya.loader.load(path, undefined, undefined, Laya.Loader.JSON);
        const rows = this.resolveRows<T>(raw);
        const table = this.createTable(name, rows);
        this.tables.set(name, table);
        return table;
    }

    getTable<T>(name: string): ConfigTable<T> {
        const table = this.tables.get(name);
        if (!table) {
            throw new Error(`Config table is not loaded: ${name}`);
        }

        return table as ConfigTable<T>;
    }

    hasTable(name: string): boolean {
        return this.tables.has(name);
    }

    clear(): void {
        this.tables.clear();
    }

    private resolveRows<T>(raw: any): T[] {
        if (Array.isArray(raw)) return raw as T[];
        if (Array.isArray(raw?.dataList)) return raw.dataList as T[];
        if (Array.isArray(raw?.list)) return raw.list as T[];
        if (raw?.data && typeof raw.data === "object") {
            const rows: T[] = [];
            for (const key in raw.data) {
                rows.push(raw.data[key] as T);
            }
            return rows;
        }
        return [];
    }

    private createTable<T extends { id: number | string }>(name: string, rows: T[]): ConfigTable<T> {
        const map = new Map<number | string, T>();

        for (const row of rows) {
            map.set(row.id, row);
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
}
