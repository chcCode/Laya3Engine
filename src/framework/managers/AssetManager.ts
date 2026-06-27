/** Laya 可加载资源地址。 */
export type AssetUrl = string | Readonly<Laya.ILoadURL>;

/** 资源加载与缓存访问封装。 */
export class AssetManager {
    /** 加载单个或多个资源，可选进度回调返回 0-1。 */
    load<T = any>(url: AssetUrl | AssetUrl[], progress?: (value: number) => void): Promise<T> {
        const progressHandler = progress ? Laya.Handler.create(this, progress, undefined, false) : undefined;
        return Laya.loader.load(url as any, undefined, progressHandler) as Promise<T>;
    }

    /** 从 Laya 缓存中获取已加载资源。 */
    get<T = any>(url: string): T | null {
        return Laya.loader.getRes(url) as T | null;
    }

    /** 清理指定资源缓存。 */
    clear(url: string): void {
        Laya.loader.clearRes(url);
    }

    /** 按资源组清理缓存。 */
    clearGroup(group: string): void {
        Laya.Loader.clearResByGroup(group);
    }
}
