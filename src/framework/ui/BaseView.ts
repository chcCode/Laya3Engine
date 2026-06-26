import { GameApp } from "../core/GameApp";
import { LayerName } from "../managers/LayerManager";

export abstract class BaseView extends Laya.Sprite {
    protected readonly app = GameApp.I;
    protected readonly disposers: Array<() => void> = [];

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

    onUIOpened(layer: LayerName): void {
        this.onOpen(layer);
        this.app.events.emit("ui:opened", this.name || this.constructor.name);
    }

    protected listen<T>(dispose: () => void): void {
        this.disposers.push(dispose);
    }

    protected onOpen(_layer?: LayerName): void {
    }

    protected onClose(): void {
    }
}
