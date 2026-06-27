import type { BaseView } from "../ui/BaseView";
import { LayerManager, LayerName } from "./LayerManager";

export interface UIOptions {
    /** UI 挂载层级，默认挂到普通 UI 层。 */
    layer?: LayerName;
    /** 是否按 view.name 保持单例，默认 true。 */
    singleton?: boolean;
    /** 打开前是否先关闭同名 UI。 */
    closeExisting?: boolean;
}

/** 统一管理 UI 的打开、关闭和层级顺序。 */
export class UIManager {
    private readonly opened = new Map<string, BaseView>();

    constructor(private readonly layers: LayerManager) {
    }

    open<T extends BaseView>(view: T, options: UIOptions = {}): T {
        const key = this.getKey(view);
        const layer = options.layer || LayerName.UI;

        // 默认同名 UI 只保留一个，避免重复打开多个相同界面。
        if (options.closeExisting) {
            this.close(key, true);
        } else if (options.singleton !== false && this.opened.has(key)) {
            const current = this.opened.get(key) as T;
            this.bringToTop(current);
            return current;
        }

        this.layers.add(layer, view);
        this.opened.set(key, view);
        view.onUIOpened(layer);
        return view;
    }

    close(viewOrName: BaseView | string, destroy = false): boolean {
        const key = typeof viewOrName === "string" ? viewOrName : this.getKey(viewOrName);
        const view = this.opened.get(key);
        if (!view) return false;

        view.close(destroy);
        this.opened.delete(key);
        return true;
    }

    closeLayer(layer: LayerName, destroy = false): void {
        // 复制一份列表再遍历，避免 close 过程中修改 Map 影响迭代。
        for (const [key, view] of [...this.opened]) {
            if (view.parent === this.layers.get(layer)) {
                view.close(destroy);
                this.opened.delete(key);
            }
        }
    }

    closeAll(destroy = false): void {
        for (const [key, view] of [...this.opened]) {
            view.close(destroy);
            this.opened.delete(key);
        }
    }

    unregister(view: BaseView): void {
        // 支持 BaseView.close() 被直接调用时自动回收登记状态。
        const key = this.getKey(view);
        if (this.opened.get(key) === view) {
            this.opened.delete(key);
        }
    }

    get<T extends BaseView>(name: string): T | undefined {
        return this.opened.get(name) as T | undefined;
    }

    has(viewOrName: BaseView | string): boolean {
        const key = typeof viewOrName === "string" ? viewOrName : this.getKey(viewOrName);
        return this.opened.has(key);
    }

    bringToTop(viewOrName: BaseView | string): void {
        const view = typeof viewOrName === "string" ? this.opened.get(viewOrName) : viewOrName;
        if (!view?.parent) return;

        view.parent.setChildIndex(view, view.parent.numChildren - 1);
    }

    sendToBottom(viewOrName: BaseView | string): void {
        const view = typeof viewOrName === "string" ? this.opened.get(viewOrName) : viewOrName;
        if (!view?.parent) return;

        view.parent.setChildIndex(view, 0);
    }

    setViewIndex(viewOrName: BaseView | string, index: number): void {
        const view = typeof viewOrName === "string" ? this.opened.get(viewOrName) : viewOrName;
        if (!view?.parent) return;

        const safeIndex = Math.max(0, Math.min(index, view.parent.numChildren - 1));
        view.parent.setChildIndex(view, safeIndex);
    }

    bringLayerToTop(layer: LayerName): void {
        const layerNode = this.layers.get(layer);
        if (!layerNode.parent) return;

        layerNode.parent.setChildIndex(layerNode, layerNode.parent.numChildren - 1);
    }

    private getKey(view: BaseView): string {
        return view.name || view.constructor.name;
    }
}
