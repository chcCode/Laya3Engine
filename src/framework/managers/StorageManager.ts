/** 带命名空间的本地存档封装。 */
export class StorageManager {
    constructor(private readonly namespace: string) {
    }

    /** 读取 JSON 数据，失败或不存在时返回 fallback。 */
    get<T>(key: string, fallback: T): T {
        const value = Laya.LocalStorage.getItem(this.resolveKey(key));
        if (value === null || value === undefined || value === "") {
            return fallback;
        }

        try {
            return JSON.parse(value) as T;
        } catch {
            return fallback;
        }
    }

    /** 写入 JSON 数据。 */
    set<T>(key: string, value: T): void {
        Laya.LocalStorage.setItem(this.resolveKey(key), JSON.stringify(value));
    }

    /** 删除指定存档项。 */
    remove(key: string): void {
        Laya.LocalStorage.removeItem(this.resolveKey(key));
    }

    private resolveKey(key: string): string {
        return `${this.namespace}:${key}`;
    }
}
