export interface GameState {
    readonly name: string;
    enter?(from?: string): void | Promise<void>;
    exit?(to?: string): void | Promise<void>;
    update?(dt: number): void;
}

export class StateMachine {
    private readonly states = new Map<string, GameState>();
    private current?: GameState;
    private switching = false;

    get currentName(): string | undefined {
        return this.current?.name;
    }

    add(state: GameState): this {
        this.states.set(state.name, state);
        return this;
    }

    get(name: string): GameState | undefined {
        return this.states.get(name);
    }

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

    update(dt: number): void {
        this.current?.update?.(dt);
    }
}
