import type { GameApp } from "../core/GameApp";
import { LayerName } from "./LayerManager";

/** Laya 场景加载与切换封装。 */
export class SceneManager {
    private current?: Laya.Scene;

    constructor(private readonly app: GameApp) {
    }

    /** 加载场景文件并设置为当前场景。 */
    async open(url: string): Promise<Laya.Scene> {
        const scene = await Laya.Scene.load(url, Laya.Handler.create(this, (): void => undefined));
        this.setScene(scene, url);
        return scene;
    }

    /** 直接设置当前场景，会销毁旧场景。 */
    setScene(scene: Laya.Scene, name = scene.name): void {
        this.current?.destroy();
        this.current = scene;
        this.app.layers.add(LayerName.Scene, scene);
        this.app.events.emit("scene:changed", name);
    }

    /** 获取当前场景实例。 */
    getCurrent<T extends Laya.Scene = Laya.Scene>(): T | undefined {
        return this.current as T | undefined;
    }
}
