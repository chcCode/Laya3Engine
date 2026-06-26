export enum LayerName {
    Scene = "scene",
    Game = "game",
    UI = "ui",
    Popup = "popup",
    Toast = "toast",
}

export class LayerManager {
    private readonly layers = new Map<LayerName, Laya.Sprite>();
    private readonly layerOrder = [LayerName.Scene, LayerName.Game, LayerName.UI, LayerName.Popup, LayerName.Toast];

    init(root: Laya.Sprite): void {
        this.layers.clear();

        for (const name of this.layerOrder) {
            const layer = new Laya.Sprite();
            layer.name = `${name}Layer`;
            layer.mouseThrough = true;
            root.addChild(layer);
            this.layers.set(name, layer);
        }
    }

    get(name: LayerName): Laya.Sprite {
        const layer = this.layers.get(name);
        if (!layer) {
            throw new Error(`Layer not found: ${name}`);
        }

        return layer;
    }

    add(name: LayerName, node: Laya.Node): void {
        this.get(name).addChild(node);
    }

    clear(name: LayerName, destroyChildren = true): void {
        const layer = this.get(name);

        if (destroyChildren) {
            layer.destroyChildren();
            return;
        }

        layer.removeChildren(0, Number.MAX_SAFE_INTEGER);
    }
}
