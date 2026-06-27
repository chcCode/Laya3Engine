import { EventBus } from "./EventBus";
import { DefaultGameConfig, GameConfig } from "./GameConfig";
import { GameModule } from "./GameModule";
import { ServiceLocator } from "./ServiceLocator";
import { StateMachine } from "./StateMachine";
import { AssetManager } from "../managers/AssetManager";
import { AudioManager } from "../managers/AudioManager";
import { ConfigManager } from "../managers/ConfigManager";
import { InputManager } from "../managers/InputManager";
import { LayerManager } from "../managers/LayerManager";
import { SceneManager } from "../managers/SceneManager";
import { StorageManager } from "../managers/StorageManager";
import { UIManager } from "../managers/UIManager";

/** 框架内置事件定义，业务可通过索引签名扩展自定义事件。 */
export interface FrameworkEvents {
    "app:ready": GameApp;
    "app:pause": void;
    "app:resume": void;
    "scene:changed": string;
    "ui:opened": string;
    "ui:closed": string;
    [key: string]: unknown;
}

/** 游戏应用根对象，负责生命周期、服务、模块和主循环。 */
export class GameApp {
    private static instance?: GameApp;

    /** 全局单例入口。 */
    static get I(): GameApp {
        if (!this.instance) {
            this.instance = new GameApp();
        }

        return this.instance;
    }

    /** 全局事件总线。 */
    readonly events = new EventBus<FrameworkEvents>();
    /** 服务容器，保存框架管理器和业务服务。 */
    readonly services = new ServiceLocator();
    /** 全局状态机。 */
    readonly states = new StateMachine();
    /** 当前应用配置。 */
    readonly config: GameConfig = { ...DefaultGameConfig };
    /** 已挂载的游戏模块。 */
    readonly modules: GameModule[] = [];

    private booted = false;

    /** 资源管理器。 */
    get assets(): AssetManager {
        return this.services.get(AssetManager);
    }

    /** 音频管理器。 */
    get audio(): AudioManager {
        return this.services.get(AudioManager);
    }

    /** 输入管理器。 */
    get input(): InputManager {
        return this.services.get(InputManager);
    }

    /** 通用配置加载器。 */
    get configs(): ConfigManager {
        return this.services.get(ConfigManager);
    }

    /** 显示层级管理器。 */
    get layers(): LayerManager {
        return this.services.get(LayerManager);
    }

    /** 场景管理器。 */
    get scenes(): SceneManager {
        return this.services.get(SceneManager);
    }

    /** 本地存档管理器。 */
    get storage(): StorageManager {
        return this.services.get(StorageManager);
    }

    /** UI 管理器。 */
    get ui(): UIManager {
        return this.services.get(UIManager);
    }

    /** 合并应用配置，可在 boot 前调用。 */
    configure(config: Partial<GameConfig>): this {
        Object.assign(this.config, config);
        return this;
    }

    /** 挂载游戏模块，模块会在 boot 中按顺序初始化和启动。 */
    use(module: GameModule): this {
        this.modules.push(module);
        return this;
    }

    /** 启动框架，只会执行一次。 */
    async boot(config: Partial<GameConfig> = {}): Promise<void> {
        if (this.booted) return;

        this.configure(config);
        this.applyStageConfig();
        await this.registerDefaultServices();

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

    /** 销毁框架，清理计时器、模块、事件和服务。 */
    dispose(): void {
        Laya.timer.clear(this, this.update);
        Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, this, this.handleVisibilityChange);

        for (const module of [...this.modules].reverse()) {
            module.dispose?.();
        }

        this.scenes.closeCurrent({ destroyCurrent: true });
        this.ui.dispose();
        this.events.clear();
        this.services.clear();
        this.modules.length = 0;
        this.booted = false;
    }

    private async registerDefaultServices(): Promise<void> {
        this.services.register(AssetManager, new AssetManager());
        this.services.register(AudioManager, new AudioManager());
        this.services.register(ConfigManager, new ConfigManager());
        this.services.register(InputManager, new InputManager());
        this.services.register(StorageManager, new StorageManager("Laya3Engine"));

        const layers = this.services.register(LayerManager, new LayerManager());
        layers.init(Laya.stage);

        const ui = this.services.register(UIManager, new UIManager(layers));
        await ui.init();
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
