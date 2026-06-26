export class StorageManager {
    constructor(private readonly namespace: string) {
    }

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

    set<T>(key: string, value: T): void {
        Laya.LocalStorage.setItem(this.resolveKey(key), JSON.stringify(value));
    }

    remove(key: string): void {
        Laya.LocalStorage.removeItem(this.resolveKey(key));
    }

    private resolveKey(key: string): string {
        return `${this.namespace}:${key}`;
    }
}
