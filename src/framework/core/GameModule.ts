import type { GameApp } from "./GameApp";

export interface GameModule {
    readonly name: string;
    init?(app: GameApp): void | Promise<void>;
    start?(app: GameApp): void | Promise<void>;
    update?(dt: number): void;
    dispose?(): void;
}
