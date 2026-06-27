/** 键盘输入状态管理器。 */
export class InputManager {
    private readonly keys = new Set<number>();

    /** 绑定舞台键盘事件。 */
    init(stage: Laya.Stage): void {
        stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
        stage.on(Laya.Event.KEY_UP, this, this.onKeyUp);
        stage.on(Laya.Event.BLUR, this, this.clear);
    }

    /** 判断指定 keyCode 当前是否处于按下状态。 */
    isDown(keyCode: number): boolean {
        return this.keys.has(keyCode);
    }

    /** 清空全部按键状态，通常在窗口失焦时调用。 */
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
