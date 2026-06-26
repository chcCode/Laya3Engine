export class InputManager {
    private readonly keys = new Set<number>();

    init(stage: Laya.Stage): void {
        stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
        stage.on(Laya.Event.KEY_UP, this, this.onKeyUp);
        stage.on(Laya.Event.BLUR, this, this.clear);
    }

    isDown(keyCode: number): boolean {
        return this.keys.has(keyCode);
    }

    clear(): void {
        this.keys.clear();
    }

    private onKeyDown(event: Laya.Event): void {
        this.keys.add(event.keyCode);
    }

    private onKeyUp(event: Laya.Event): void {
        this.keys.delete(event.keyCode);
    }
}
