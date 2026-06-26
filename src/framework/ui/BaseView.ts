import { GameApp } from "../core/GameApp";
import { LayerName } from "../managers/LayerManager";

export abstract class BaseView extends Laya.Sprite {
    protected readonly app = GameApp.I;
    protected readonly disposers: Array<() => void> = [];

    open(layer: LayerName = LayerName.UI): void {
        this.app.layers.add(layer, this);
        this.onOpen();
        this.app.events.emit("ui:opened", this.name || this.constructor.name);
    }

    close(destroy = false): void {
        this.disposers.splice(0).forEach((dispose) => dispose());
        this.removeSelf();
        this.onClose();
        this.app.events.emit("ui:closed", this.name || this.constructor.name);

        if (destroy) {
            this.destroy();
        }
    }

    protected listen<T>(dispose: () => void): void {
        this.disposers.push(dispose);
    }

    protected onOpen(): void {
    }

    protected onClose(): void {
    }
}
