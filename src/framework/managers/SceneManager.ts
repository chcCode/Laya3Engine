import type { GameApp } from "../core/GameApp";
import { LayerName } from "./LayerManager";

/** 场景切换时可选的资源清理策略。 */
export interface SceneCleanupOptions {
    /** 是否销毁当前场景节点，默认 true。 */
    destroyCurrent?: boolean;
    /** 是否清理当前场景文件本身的缓存，默认 false。 */
    clearCurrentSceneRes?: boolean;
    /** 额外需要清理的资源 URL。 */
    clearUrls?: string[];
    /** 额外需要清理的资源组。 */
    clearGroups?: string[];
}

/** 打开场景时的扩展选项。 */
export interface SceneOpenOptions extends SceneCleanupOptions {
    /** 事件中上报的场景名，默认使用 url。 */
    name?: string;
    /** 切换场景前是否关闭普通 UI，默认 false。 */
    closeUI?: boolean;
    /** 是否允许重复打开当前 url，默认 false。 */
    forceReload?: boolean;
    /** 加载进度回调，范围 0-1。 */
    progress?: (value: number) => void;
    /** 当前场景关联的额外资源，后续清理当前场景时会一起释放。 */
    trackedUrls?: string[];
    /** 当前场景关联的资源组，后续清理当前场景时会一起释放。 */
    trackedGroups?: string[];
}

/** 当前场景运行时信息。 */
export interface SceneInfo {
    /** 场景资源地址。 */
    url: string;
    /** 场景显示名。 */
    name: string;
    /** 场景实例。 */
    scene: Laya.Scene;
    /** 场景额外关联资源 URL。 */
    trackedUrls: string[];
    /** 场景额外关联资源组。 */
    trackedGroups: string[];
}

/** Laya 场景加载、切换和资源清理封装。 */
export class SceneManager {
    private current?: SceneInfo;
    private switchingId = 0;

    constructor(private readonly app: GameApp) {
    }

    /** 当前是否存在正在进行的场景切换。 */
    get isSwitching(): boolean {
        return this.switchingId > 0;
    }

    /** 当前场景 URL。 */
    get currentUrl(): string | undefined {
        return this.current?.url;
    }

    /** 当前场景显示名。 */
    get currentName(): string | undefined {
        return this.current?.name;
    }

    /**
     * 加载并切换到指定场景。
     * 默认会销毁旧场景节点，但不会主动清理旧场景资源缓存，避免频繁切换时重复加载。
     */
    async open(url: string, options: SceneOpenOptions = {}): Promise<Laya.Scene> {
        if (this.switchingId === 0 && !options.forceReload && this.current?.url === url) {
            return this.current.scene;
        }

        const switchId = ++this.switchingId;
        const progress = options.progress
            ? Laya.Handler.create(this, options.progress, undefined, false)
            : undefined;

        try {
            const scene = await Laya.Scene.load(url, Laya.Handler.create(this, (): void => undefined), progress);
            if (switchId !== this.switchingId) {
                scene.destroy(true);
                throw new Error(`Scene switch was superseded: ${url}`);
            }

            this.applyScene(scene, url, options);
            return scene;
        } finally {
            if (switchId === this.switchingId) {
                this.switchingId = 0;
            }
        }
    }

    /** open 的语义化别名，业务代码更推荐用 switchTo 表达切换意图。 */
    switchTo(url: string, options: SceneOpenOptions = {}): Promise<Laya.Scene> {
        return this.open(url, options);
    }

    /**
     * 直接设置当前场景实例。
     * 适合外部已经创建好场景实例，或需要把编辑器当前场景纳入管理的情况。
     */
    setScene(scene: Laya.Scene, name = scene.name, options: SceneOpenOptions = {}): void {
        this.applyScene(scene, name, { ...options, name });
    }

    /** 关闭当前场景，并按需清理关联资源。 */
    closeCurrent(options: SceneCleanupOptions = {}): void {
        if (!this.current) return;

        const current = this.current;
        this.current = undefined;

        if (options.destroyCurrent !== false) {
            current.scene.destroy(true);
        } else {
            current.scene.removeSelf();
        }

        if (options.clearCurrentSceneRes) {
            this.clearSceneResource(current.url);
        }

        this.clearResources(current.trackedUrls);
        this.clearGroups(current.trackedGroups);
        this.clearResources(options.clearUrls);
        this.clearGroups(options.clearGroups);
    }

    /** 获取当前场景实例。 */
    getCurrent<T extends Laya.Scene = Laya.Scene>(): T | undefined {
        return this.current?.scene as T | undefined;
    }

    /** 获取当前场景完整信息。 */
    getCurrentInfo(): SceneInfo | undefined {
        return this.current;
    }

    /** 给当前场景追加关联资源，关闭或清理当前场景时会一起释放。 */
    trackResources(urls: string[] = [], groups: string[] = []): void {
        if (!this.current) return;

        this.current.trackedUrls.push(...urls);
        this.current.trackedGroups.push(...groups);
    }

    /** 清理指定资源 URL。 */
    clearResources(urls: string[] = []): void {
        for (const url of urls) {
            Laya.loader.clearRes(url);
        }
    }

    /** 清理指定资源组。 */
    clearGroups(groups: string[] = []): void {
        for (const group of groups) {
            Laya.Loader.clearResByGroup(group);
        }
    }

    private applyScene(scene: Laya.Scene, url: string, options: SceneOpenOptions): void {
        if (options.closeUI) {
            this.app.ui.closeAll(true);
        }

        this.closeCurrent(options);

        const name = options.name || url;
        this.current = {
            url,
            name,
            scene,
            trackedUrls: [...(options.trackedUrls || [])],
            trackedGroups: [...(options.trackedGroups || [])],
        };

        this.app.layers.add(LayerName.Scene, scene);
        this.app.events.emit("scene:changed", name);
    }

    private clearSceneResource(url: string): void {
        // 同时调用 Scene.destroy 与 Loader.clearRes，兼容场景缓存和普通资源缓存。
        Laya.Scene.destroy(url);
        Laya.loader.clearRes(url);
    }
}
