import type { BaseView } from "../ui/BaseView";
import { LayerManager, LayerName } from "./LayerManager";

/** UI ?????????????? */
export enum UILayerName {
    Low = "low",
    Middle = "middle",
    High = "high",
}

export interface UIOptions {
    /** UI ????????? Middle ?? */
    layer?: UILayerName;
    /** ??? view.name ??????? true? */
    singleton?: boolean;
    /** ?????????? UI? */
    closeExisting?: boolean;
}

export type PrefabViewFactory<T extends BaseView> = (prefabRoot: Laya.Node) => T;

/** ???? UI ???????????????????? */
export class UIManager {
    private readonly opened = new Map<string, BaseView>();
    private readonly root = new Laya.Sprite();
    private readonly uiLayers = new Map<UILayerName, Laya.Sprite>();
    private readonly layerOrder = [UILayerName.Low, UILayerName.Middle, UILayerName.High];

    constructor(private readonly layers: LayerManager) {
        this.initRoot();
    }

    /** UI ????????????????? UI ?? */
    getRoot(): Laya.Sprite {
        return this.root;
    }

    /** ?? UI ??????? */
    getLayer(layer: UILayerName = UILayerName.Middle): Laya.Sprite {
        const node = this.uiLayers.get(layer);
        if (!node) {
            throw new Error(`UI layer not found: ${layer}`);
        }

        return node;
    }

    /** ?? UI ?????? UI ?????????????? */
    open<T extends BaseView>(view: T, options: UIOptions = {}): T {
        const key = this.getKey(view);
        const layer = options.layer || UILayerName.Middle;

        // ???? UI ???????????????????
        if (options.closeExisting) {
            this.close(key, true);
        } else if (options.singleton !== false && this.opened.has(key)) {
            const current = this.opened.get(key) as T;
            this.bringToTop(current);
            return current;
        }

        this.getLayer(layer).addChild(view);
        this.opened.set(key, view);
        view.onUIOpened(layer);
        return view;
    }

    /** ??? prefab????? View ?????? */
    async openPrefab<T extends BaseView>(
        url: string,
        createView: PrefabViewFactory<T>,
        options: UIOptions = {},
    ): Promise<T> {
        const prefabRoot = await Laya.Prefab.instantiate<Laya.Node>(url);
        const view = createView(prefabRoot);
        return this.open(view, options);
    }

    /** ???? UI????????????? */
    close(viewOrName: BaseView | string, destroy = false): boolean {
        const key = typeof viewOrName === "string" ? viewOrName : this.getKey(viewOrName);
        const view = this.opened.get(key);
        if (!view) return false;

        view.close(destroy);
        this.opened.delete(key);
        return true;
    }

    /** ???? UI ??????????? UI? */
    closeLayer(layer: UILayerName = UILayerName.Middle, destroy = false): void {
        const layerNode = this.getLayer(layer);

        // ???????????? close ????? Map ?????
        for (const [key, view] of [...this.opened]) {
            if (view.parent === layerNode) {
                view.close(destroy);
                this.opened.delete(key);
            }
        }
    }

    /** ??????? UI? */
    closeAll(destroy = false): void {
        for (const [key, view] of [...this.opened]) {
            view.close(destroy);
            this.opened.delete(key);
        }
    }

    /** ?? UI ???????????? GameApp.dispose ???? */
    dispose(): void {
        this.closeAll(true);
        Laya.stage.off(Laya.Event.RESIZE, this, this.resizeRoot);
        this.root.removeSelf();
        this.root.destroy(true);
        this.uiLayers.clear();
    }

    /** ??????? UI ??????????? */
    unregister(view: BaseView): void {
        // ?? BaseView.close() ???????????????
        const key = this.getKey(view);
        if (this.opened.get(key) === view) {
            this.opened.delete(key);
        }
    }

    /** ??????????? UI? */
    get<T extends BaseView>(name: string): T | undefined {
        return this.opened.get(name) as T | undefined;
    }

    /** ?? UI ??????? */
    has(viewOrName: BaseView | string): boolean {
        const key = typeof viewOrName === "string" ? viewOrName : this.getKey(viewOrName);
        return this.opened.has(key);
    }

    /** ? UI ???? UI ??????? */
    bringToTop(viewOrName: BaseView | string): void {
        const view = typeof viewOrName === "string" ? this.opened.get(viewOrName) : viewOrName;
        if (!view?.parent) return;

        view.parent.setChildIndex(view, view.parent.numChildren - 1);
    }

    /** ? UI ???? UI ??????? */
    sendToBottom(viewOrName: BaseView | string): void {
        const view = typeof viewOrName === "string" ? this.opened.get(viewOrName) : viewOrName;
        if (!view?.parent) return;

        view.parent.setChildIndex(view, 0);
    }

    /** ?? UI ??? UI ????????? */
    setViewIndex(viewOrName: BaseView | string, index: number): void {
        const view = typeof viewOrName === "string" ? this.opened.get(viewOrName) : viewOrName;
        if (!view?.parent) return;

        const safeIndex = Math.max(0, Math.min(index, view.parent.numChildren - 1));
        view.parent.setChildIndex(view, safeIndex);
    }

    /** ? UI ?????? UI ??????? */
    bringLayerToTop(layer: UILayerName): void {
        const layerNode = this.getLayer(layer);
        this.root.setChildIndex(layerNode, this.root.numChildren - 1);
    }

    private initRoot(): void {
        this.root.name = "UIRoot";
        this.root.mouseThrough = true;
        this.layers.add(LayerName.UI, this.root);

        for (const layer of this.layerOrder) {
            const node = new Laya.Sprite();
            node.name = `${layer}UILayer`;
            node.mouseThrough = true;
            this.root.addChild(node);
            this.uiLayers.set(layer, node);
        }

        this.resizeRoot();
        Laya.stage.on(Laya.Event.RESIZE, this, this.resizeRoot);
    }

    private resizeRoot(): void {
        this.root.pos(0, 0);
        this.root.size(Laya.stage.width, Laya.stage.height);

        for (const layer of this.uiLayers.values()) {
            layer.pos(0, 0);
            layer.size(this.root.width, this.root.height);
        }
    }

    private getKey(view: BaseView): string {
        return view.name || view.constructor.name;
    }
}
