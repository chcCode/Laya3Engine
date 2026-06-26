import { EventBus } from "./EventBus";
import { DefaultGameConfig, GameConfig } from "./GameConfig";
import { GameModule } from "./GameModule";
import { ServiceLocator } from "./ServiceLocator";
import { StateMachine } from "./StateMachine";
import { AssetManager } from "../managers/AssetManager";
import { AudioManager } from "../managers/AudioManager";
import { InputManager } from "../managers/InputManager";
import { LayerManager } from "../managers/LayerManager";
import { SceneManager } from "../managers/SceneManager";
import { StorageManager } from "../managers/StorageManager";

export interface FrameworkEvents {
    "app:ready": GameApp;
    "app:pause": void;
    "app:resume": void;
    "scene:changed": string;
    "ui:opened": string;
    "ui:closed": string;
    [key: string]: unknown;
}

export class GameApp {
    private static instance?: GameApp;

    static get I(): GameApp {
        if (!this.instance) {
            this.instance = new GameApp();
        }

        return this.instance;
    }

    readonly events = new EventBus<FrameworkEvents>();
    readonly services = new ServiceLocator();
    readonly states = new StateMachine();
    readonly config: GameConfig = { ...DefaultGameConfig };
    readonly modules: GameModule[] = [];

    private booted = false;

    get assets(): AssetManager {
        return this.services.get(AssetManager);
    }

    get audio(): AudioManager {
        return this.services.get(AudioManager);
    }

    get input(): InputManager {
        return this.services.get(InputManager);
    }

    get layers(): LayerManager {
        return this.services.get(LayerManager);
    }

    get scenes(): SceneManager {
        return this.services.get(SceneManager);
    }

    get storage(): StorageManager {
        return this.services.get(StorageManager);
    }

    configure(config: Partial<GameConfig>): this {
        Object.assign(this.config, config);
        return this;
    }

    use(module: GameModule): this {
        this.modules.push(module);
        return this;
    }

    async boot(config: Partial<GameConfig> = {}): Promise<void> {
        if (this.booted) return;

        this.configure(config);
        this.applyStageConfig();
        this.registerDefaultServices();

        for (const module of this.modules) {
            await module.init?.(this);
        }

        Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this.handleVisibilityChange);
        Laya.timer.frameLoop(1, this, this.update);

        for (const module of this.modules) {
            await module.start?.(this);
        }

        this.booted = true;
        this.events.emit("app:ready", this);
    }

    dispose(): void {
        Laya.timer.clear(this, this.update);
        Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, this, this.handleVisibilityChange);

        for (const module of [...this.modules].reverse()) {
            module.dispose?.();
        }

        this.events.clear();
        this.services.clear();
        this.modules.length = 0;
        this.booted = false;
    }

    private registerDefaultServices(): void {
        this.services.register(AssetManager, new AssetManager());
        this.services.register(AudioManager, new AudioManager());
        this.services.register(InputManager, new InputManager());
        this.services.register(StorageManager, new StorageManager("Laya3Engine"));

        const layers = this.services.register(LayerManager, new LayerManager());
        layers.init(Laya.stage);

        this.services.register(SceneManager, new SceneManager(this));
        this.input.init(Laya.stage);
    }

    private applyStageConfig(): void {
        Laya.stage.scaleMode = this.config.scaleMode;
        Laya.stage.screenMode = this.config.screenMode;
        Laya.stage.alignH = this.config.alignH;
        Laya.stage.alignV = this.config.alignV;
        Laya.stage.bgColor = this.config.backgroundColor;
    }

    private update(): void {
        const dt = Laya.timer.delta / 1000;
        this.states.update(dt);

        for (const module of this.modules) {
            module.update?.(dt);
        }
    }

    private handleVisibilityChange(): void {
        this.events.emit(Laya.stage.isVisibility ? "app:resume" : "app:pause", undefined);
    }
}
