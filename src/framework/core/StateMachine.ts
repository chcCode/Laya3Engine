/** 游戏状态接口，可用于大厅、战斗、结算等流程切换。 */
export interface GameState {
    /** 状态唯一名称。 */
    readonly name: string;
    /** 进入状态时调用，from 为上一个状态名。 */
    enter?(from?: string): void | Promise<void>;
    /** 离开状态时调用，to 为下一个状态名。 */
    exit?(to?: string): void | Promise<void>;
    /** 当前状态每帧更新，dt 单位为秒。 */
    update?(dt: number): void;
}

/** 支持异步 enter/exit 的简单状态机。 */
export class StateMachine {
    private readonly states = new Map<string, GameState>();
    private current?: GameState;
    private switching = false;

    /** 当前状态名，没有状态时返回 undefined。 */
    get currentName(): string | undefined {
        return this.current?.name;
    }

    /** 添加或覆盖一个状态。 */
    add(state: GameState): this {
        this.states.set(state.name, state);
        return this;
    }

    /** 根据名称获取状态实例。 */
    get(name: string): GameState | undefined {
        return this.states.get(name);
    }

    /** 切换状态，会按 exit -> enter 顺序执行。 */
    async change(name: string): Promise<void> {
        if (this.switching || this.current?.name === name) return;

        const next = this.states.get(name);
        if (!next) {
            throw new Error(`State not found: ${name}`);
        }

        this.switching = true;
        const previous = this.current;

        try {
            await previous?.exit?.(next.name);
            this.current = next;
            await next.enter?.(previous?.name);
        } finally {
            this.switching = false;
        }
    }

    /** 驱动当前状态更新。 */
    update(dt: number): void {
        this.current?.update?.(dt);
    }
}
