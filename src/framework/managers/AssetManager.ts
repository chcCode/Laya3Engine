export type AssetUrl = string | Readonly<Laya.ILoadURL>;

export class AssetManager {
    load<T = any>(url: AssetUrl | AssetUrl[], progress?: (value: number) => void): Promise<T> {
        const progressHandler = progress ? Laya.Handler.create(this, progress, undefined, false) : undefined;
        return Laya.loader.load(url as any, undefined, progressHandler) as Promise<T>;
    }

    get<T = any>(url: string): T | null {
        return Laya.loader.getRes(url) as T | null;
    }

    clear(url: string): void {
        Laya.loader.clearRes(url);
    }

    clearGroup(group: string): void {
        Laya.Loader.clearResByGroup(group);
    }
}
