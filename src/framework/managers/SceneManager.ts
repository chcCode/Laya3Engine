import type { GameApp } from "../core/GameApp";
import { LayerName } from "./LayerManager";

export class SceneManager {
    private current?: Laya.Scene;

    constructor(private readonly app: GameApp) {
    }

    async open(url: string): Promise<Laya.Scene> {
        const scene = await Laya.Scene.load(url, Laya.Handler.create(this, (): void => undefined));
        this.setScene(scene, url);
        return scene;
    }

    setScene(scene: Laya.Scene, name = scene.name): void {
        this.current?.destroy();
        this.current = scene;
        this.app.layers.add(LayerName.Scene, scene);
        this.app.events.emit("scene:changed", name);
    }

    getCurrent<T extends Laya.Scene = Laya.Scene>(): T | undefined {
        return this.current as T | undefined;
    }
}
