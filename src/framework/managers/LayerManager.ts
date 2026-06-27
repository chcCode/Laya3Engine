/** 框架预设显示层，从下到上依次叠放。 */
export enum LayerName {
    Scene = "scene",
    Game = "game",
    UI = "ui",
    Popup = "popup",
    Toast = "toast",
}

/** 舞台显示层级管理器。 */
export class LayerManager {
    private readonly layers = new Map<LayerName, Laya.Sprite>();
    private readonly layerOrder = [LayerName.Scene, LayerName.Game, LayerName.UI, LayerName.Popup, LayerName.Toast];

    /** 初始化所有预设层并挂载到 root。 */
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

    /** 获取指定显示层。 */
    get(name: LayerName): Laya.Sprite {
        const layer = this.layers.get(name);
        if (!layer) {
            throw new Error(`Layer not found: ${name}`);
        }

        return layer;
    }

    /** 将节点添加到指定层级。 */
    add(name: LayerName, node: Laya.Node): void {
        this.get(name).addChild(node);
    }

    /** 清理指定层级下的子节点。 */
    clear(name: LayerName, destroyChildren = true): void {
        const layer = this.get(name);

        if (destroyChildren) {
            layer.destroyChildren();
            return;
        }

        layer.removeChildren(0, Number.MAX_SAFE_INTEGER);
    }
}
