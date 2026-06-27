import { GameApp } from "../core/GameApp";
import { LayerName } from "../managers/LayerManager";

export abstract class BaseView extends Laya.Sprite {
    protected readonly app = GameApp.I;
    protected readonly disposers: Array<() => void> = [];

    /** 打开界面时统一交给 UIManager，便于层级和单例管理。 */
    open(layer: LayerName = LayerName.UI): void {
        this.app.ui.open(this, { layer });
    }

    close(destroy = false): void {
        this.disposers.splice(0).forEach((dispose) => dispose());
        this.removeSelf();
        this.onClose();
        this.app.ui.unregister(this);
        this.app.events.emit("ui:closed", this.name || this.constructor.name);

        if (destroy) {
            this.destroy();
        }
    }

    /** 由 UIManager 在界面真正挂到层级后回调。 */
    onUIOpened(layer: LayerName): void {
        this.onOpen(layer);
        this.app.events.emit("ui:opened", this.name || this.constructor.name);
    }

    /** 保存外部监听清理函数，关闭界面时统一执行。 */
    protected listen<T>(dispose: () => void): void {
        this.disposers.push(dispose);
    }

    /** 界面打开后的扩展点，子类可在这里创建节点和注册事件。 */
    protected onOpen(_layer?: LayerName): void {
    }

    /** 界面关闭后的扩展点，子类可在这里解绑自身事件。 */
    protected onClose(): void {
    }
}
